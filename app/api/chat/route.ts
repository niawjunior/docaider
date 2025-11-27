import { convertToModelMessages, stepCountIs, streamText, UIMessage, tool } from "ai";
import { openai } from "@ai-sdk/openai";

import { NextRequest } from "next/server";

import { createClient, createServiceClient } from "../../utils/supabase/server";
import { askQuestionTool, createAskQuestionTool, finishTool } from "@/app/tools/llm-tools";
import { createReadCurrentPageTool } from "@/app/tools/embed-tools";
import { db } from "../../../db/config";
import {
  credits,
  documents,
  chats,
  knowledgeBases,
  userConfig,
} from "../../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

// const openai = createOpenAI({
//   baseURL: `https://gateway.ai.cloudflare.com/v1/a599ab03a24f46fa6aecd03babd1bb50/docaider/openai`,
// });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    messages,
    id,
    chatId, // Support both id and chatId
    isKnowledgeBase,
    knowledgeBaseId,
    isEmbed = false,
    alwaysUseDocument = false,
    pageContent,
    activeTool,
  } = (await req.json()) as {
    messages: any[];
    id?: string;
    chatId?: string;
    isKnowledgeBase: boolean;
    knowledgeBaseId: string;
    isEmbed?: boolean;
    alwaysUseDocument?: boolean;
    pageContent?: {
      title: string;
      content: string;
      url: string;
    };
    activeTool?: "knowledge-base" | "current-page" | "auto";
  };

  const finalChatId = chatId || id;

  if (!finalChatId) {
    return new Response(JSON.stringify({ error: "Chat ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Authentication Check ---
  let user = null;
  let balance = 0;
  let userConfigData = null;

  if (!isEmbed) {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (!user) {
      console.error("User not found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all user config using Drizzle ORM
    const configResult = await db
      .select({
        useDocument: userConfig.useDocument,
      })
      .from(userConfig)
      .where(eq(userConfig.id, user.id))
      .limit(1);
    userConfigData = configResult;

    // Get user credit using Drizzle ORM
    const creditResult = await db
      .select({ balance: credits.balance })
      .from(credits)
      .where(eq(credits.userId, user.id))
      .limit(1);
    balance = creditResult[0]?.balance || 0;
  }

  // --- Knowledge Base & Document Fetching ---
  let knowledgeBaseDocumentIds: string[] = [];
  let isPublicKnowledgeBase = false;
  let hasSharedAccess = false;
  let allowEmbedding = false;
  let kbInstruction = "";
  const serviceSupabase = createServiceClient();

  try {
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases?.id, knowledgeBaseId));

    // If knowledge base exists, get its details
    if (knowledgeBase) {
      knowledgeBaseDocumentIds = knowledgeBase.documentIds || [];
      isPublicKnowledgeBase = knowledgeBase.isPublic || false;
      allowEmbedding = knowledgeBase.allowEmbedding || false;
      kbInstruction = knowledgeBase.instruction || "";

      // Access Control Logic
      if (isEmbed) {
        // For embed, check if embedding is allowed
        if (!isPublicKnowledgeBase && !allowEmbedding) {
          return new Response(
            JSON.stringify({
              error: "Embedding not allowed for this knowledge base",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // For authenticated user, check ownership or shared access
        if (
          !isPublicKnowledgeBase &&
          knowledgeBase.userId !== user?.id &&
          user?.email
        ) {
          const { data: sharedAccess } = await serviceSupabase
            .from("knowledge_base_shares")
            .select("id")
            .eq("knowledge_base_id", knowledgeBaseId)
            .eq("shared_with_email", user.email)
            .single();

          if (sharedAccess) {
            hasSharedAccess = true;
          }
        }
      }
    } else {
      console.warn(`Knowledge base with ID ${knowledgeBaseId} not found`);
      if (isKnowledgeBase || isEmbed) {
        return new Response(
          JSON.stringify({ message: "Knowledge base not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  } catch (error) {
    console.error("Error fetching knowledge base:", error);
    if (isKnowledgeBase || isEmbed) {
      return new Response(
        JSON.stringify({ message: "Error fetching knowledge base" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Get documents using Drizzle ORM
  const allDocuments = await db
    .select({
      id: documents.id,
      documentId: documents.documentId,
      documentName: documents.documentName,
      title: documents.title,
    })
    .from(documents)
    .where(
      (isKnowledgeBase || isEmbed) && knowledgeBaseId
        ? // If it's a knowledge base request (embed or app)
          and(
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, true),
            // Access control logic:
            // 1. Embed: No user ID check (public/embedded KB)
            // 2. App Public/Shared: No user ID check
            // 3. App Private: Check user ID
            isEmbed ||
              (isPublicKnowledgeBase !== true && hasSharedAccess !== true)
              ? isEmbed
                ? undefined // No user check for embed
                : eq(documents.userId, user!.id) // User check for private app access
              : undefined,
            knowledgeBaseDocumentIds.length > 0
              ? inArray(documents.documentId, knowledgeBaseDocumentIds)
              : eq(documents.id, -1)
          )
        : // Standard app chat (not KB specific)
          and(
            eq(documents.userId, user!.id),
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, isKnowledgeBase)
          )
    )
    .orderBy(documents.updatedAt);

  // --- Tool Selection ---
  let tools: any = isEmbed
    ? {
        askQuestion: createAskQuestionTool({
          knowledgeBaseId,
          isEmbed: true,
        }),
        finish: finishTool,
      }
    : { askQuestion: askQuestionTool, finish: finishTool };
  if (isEmbed && (activeTool === "current-page" || activeTool === "auto") && pageContent) {
    if (activeTool === "auto") {
      // If auto, allow both tools
      tools = {
        askQuestion: createAskQuestionTool({
          knowledgeBaseId,
          isEmbed: true,
        }),
        readCurrentPage: createReadCurrentPageTool(pageContent),
        finish: finishTool,
      };
    } else {
      // If specifically current-page, only allow that
      tools = {
        readCurrentPage: createReadCurrentPageTool(pageContent),
        finish: finishTool,
      };
    }
  }

  // --- System Prompt Selection ---
  const systemPrompt = isEmbed
    ? activeTool === "current-page" || activeTool === "auto"
      ? `
      ${kbInstruction ? `\n${kbInstruction}\n` : ""}
      
      **CRITICAL INSTRUCTION: IDENTITY & PERSONA**
      - **IDENTITY CHECK**: If the user addresses you by a name other than your defined name (e.g., "Champ" instead of "Pakorn Noi"), you **MUST** politely correct them and reaffirm your identity as defined in the instructions.
      - When replying in Thai:
        • Use appropriate polite particles (**ครับ** or **ค่ะ/คะ**) that match the gender and persona defined in your instructions.
        • If no gender is specified, use polite professional language.

      **TOOL USAGE: READ CURRENT PAGE**
      The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines. viewing a specific web page. Your primary goal is to answer questions about the content of this page.
      
      - You have access to a tool called \`readCurrentPage\`.
      - **YOU MUST USE THIS TOOL** to retrieve the content of the page the user is viewing, **UNLESS** you have already called it in this conversation turn.
      - **DO NOT** call \`readCurrentPage\` more than once.
      - Once you have the content, answer the user's question based on that content.
      
      **BEHAVIOR**:
      - If the user asks "what is this page about?" or "summarize this page", call \`readCurrentPage\`.
      - Always be polite and helpful.
      - If the page content is empty or unreadable, inform the user politely.

      **TOOL USAGE: ASK QUESTION (Knowledge Base)**
      - You also have access to the \`askQuestion\` tool to query the knowledge base.
      - **Use this tool** if the user's question is about the documents in the knowledge base, rather than the current page.
      - **Avoid Redundant Calls**: If you have already called \`askQuestion\` in the current conversation turn and received a valid response, **DO NOT** call it again. Use the information you have to answer the user.
      - **No Loops**: If a tool call returns "No relevant documents found" or a similar error, **DO NOT** call the same tool again with the same parameters. Instead, politely inform the user that the information is not available.
      

       🎯 **Your Mission**:
    -   Transform documents into structured, searchable knowledge.
    -   Make document intelligence accessible, clear, and engaging.
    -   Provide fast, accurate answers from documents with proper source attribution.
    -   Respond concisely and professionally, always avoiding technical jargon, raw code, JSON, or internal framework details.
   
      **Tone & Voice**:
      - Friendly, clear, and professional.
      `
      : `
      ${kbInstruction ? `\n${kbInstruction}\n` : ""}
      
      **CRITICAL INSTRUCTION: STRICT CONTEXT ONLY**
      - You are a specialized assistant for this specific knowledge base.
      - You must **ONLY** answer questions based on the information found in the provided documents.
      - **DO NOT** use your general knowledge to answer questions that are not related to the documents.
      - If the user asks a question that cannot be answered using the documents, you must politely refuse and state that the information is not available in the knowledge base.
      - **EXCEPTION**: You may answer greetings and general pleasantries (e.g., "Hello", "How are you?") in the persona defined above.
      - **IDENTITY CHECK**: If the user addresses you by a name other than your defined name (e.g., "Champ" instead of "Pakorn Noi"), you **MUST** politely correct them and reaffirm your identity as defined in the instructions.

      - When replying in Thai:
      • Use appropriate polite particles (**ครับ** or **ค่ะ/คะ**) that match the gender and persona defined in your instructions.
      • If no gender is specified, use polite professional language.  
    - Always prioritize understanding user intent.
    - Focus on knowledge extraction, organization, and retrieval from documents.
    - If user intent is ambiguous, ask clarifying questions instead of guessing.
    
    **Knowledge Management**:
    -   Current knowledge base ID: ${knowledgeBaseId}
    -   For questions about current documents, use the \`askQuestion\` tool.
    -   When a user asks how to upload documents, inform them to check the Documents section in the UI (if they are the knowledge base owner). Otherwise, inform them to contact the knowledge base owner to upload the documents.
    -   Current document count: ${allDocuments.length}
        ** Documents Name:  ${
          allDocuments.length > 0
            ? allDocuments.map((doc) => doc?.title).join(", ")
            : "No documents available."
        } **
     -  **First check if there are documents available. Inform the user to check the Documents section in the UI**
    -   * Always ask the user to specify the language to ask the question. Example: en, th*
    
    -   If a document-related tool is requested but document count is 0, politely inform the user: "No documents available."
    -   Emphasize RAG capabilities when answering questions about documents.
    -   Suggest knowledge organization strategies when appropriate.
    -   Help users build and maintain effective knowledge bases.
    -   **Always ask user to specify the language before using the tool**

    **Document Intelligence**:
    -   For document questions, identify the specific document to query if multiple are available.
    -   **Provide clear attribution to source documents in responses.**
    -   **If the tool provides a "References" section, you MUST include it in your final response.**
    -   Synthesize information across multiple documents when appropriate.
    -   Suggest related questions that might provide additional context.

    **Knowledge Organization**:
    -   Help users structure their documents for optimal retrieval.
    -   Suggest metadata and tagging strategies for better knowledge organization.
    -   Recommend knowledge base improvements based on query patterns.
    -   Identify knowledge gaps in existing document collections.

    **Multilingual Knowledge Management**:
    -   For non-English documents:
        * Maintain proper character encoding and combinations.
        * Preserve language-specific punctuation and formatting.
        * Use appropriate language-specific processing techniques.
        * For Thai language specifically: maintain character combinations and punctuation marks.
    ---
    🌐 **Tone & Voice**:
    -   Friendly, clear, and professional — like a helpful, data-savvy friend.
    -   Avoid jargon and keep responses simple, human, and welcoming.
    -   Encourage continued interaction (e.g., "Want to explore more?" or "Need a pie chart for this too?").
    `
    : `
    You are **Docaider** — a polite and friendly AI assistant specializing in Knowledge Management and RAG (Retrieval-Augmented Generation). 
    - Always respond as a **female persona**.
    🔧 **Tool Selection Guidelines**:
    1.  **Use ONLY ONE tool per message.**
    2.  Choose the most appropriate tool based on the user's explicit request. If not specified inform the user to select a tool first.
    3.  If multiple tools could apply, prioritize the most specific and relevant one.
    4.  If no tool is suitable, respond directly using natural language.
    ‼️ **IMPORTANT Tool Usage Rules**:
    * **Document Questions (askQuestion)**: If the user asks about a document AND documents are available, you should call the \`askQuestion\` tool to retrieve information.
    * **Avoid Redundant Calls**: If you have already called \`askQuestion\` in the current conversation turn and received a valid response, **DO NOT** call it again. Use the information you have to answer the user.
    * **No Loops**: If a tool call returns "No relevant documents found" or a similar error, **DO NOT** call the same tool again with the same parameters. Instead, politely inform the user that the information is not available.
    * **"This Page" Questions**: If the user asks about "this page", "current page", or "what is on the screen", and the \`readCurrentPage\` tool is available, you **MUST** use \`readCurrentPage\` instead of \`askQuestion\`.
    * **Credit Unavailability**: If the credit balance is 0, politely inform the user that tools cannot be used because they don't have enough credit.
    ---

    🧠 **Behavior Guidelines**:

    **General Principles**:
    
    - When replying in Thai:
      • Use appropriate polite particles (**ครับ** or **ค่ะ/คะ**) that match the gender and persona defined in your instructions.
    - Always prioritize understanding user intent.
    - Focus on knowledge extraction, organization, and retrieval from documents.
    - If user intent is ambiguous, ask clarifying questions instead of guessing.

    **Credit Management**:
    - If the credit balance is 0, politely inform the user that tools cannot be used because they don't have enough credit.
    
    **Knowledge Management**:
    -   Current knowledge base ID: ${knowledgeBaseId}
    -   For questions about current documents, use the \`askQuestion\` tool.
    -   When a user asks how to upload documents, inform them to check the Documents section in the UI (if they are the knowledge base owner). Otherwise, inform them to contact the knowledge base owner to upload the documents.
    -   Current document count: ${allDocuments.length}
        ** Documents Name:  ${
          allDocuments.length > 0
            ? allDocuments.map((doc) => doc?.title).join(", ")
            : "No documents available."
        } **
     -  **First check if there are documents available. Inform the user to check the Documents section in the UI**
    -   * Always ask the user to specify the language to ask the question. Example: en, th*
    
    -   If a document-related tool is requested but document count is 0, politely inform the user: "No documents available."
    -   Emphasize RAG capabilities when answering questions about documents.
    -   Suggest knowledge organization strategies when appropriate.
    -   Help users build and maintain effective knowledge bases.
    -   **Always ask user to specify the language before using the tool**

    **Document Intelligence**:
    -   For document questions, identify the specific document to query if multiple are available.
    -   Provide clear attribution to source documents in responses.
    -   Synthesize information across multiple documents when appropriate.
    -   Suggest related questions that might provide additional context.

    **Knowledge Organization**:
    -   Help users structure their documents for optimal retrieval.
    -   Suggest metadata and tagging strategies for better knowledge organization.
    -   Recommend knowledge base improvements based on query patterns.
    -   Identify knowledge gaps in existing document collections.

    **Multilingual Knowledge Management**:
    -   For non-English documents:
        * Maintain proper character encoding and combinations.
        * Preserve language-specific punctuation and formatting.
        * Use appropriate language-specific processing techniques.
        * For Thai language specifically: maintain character combinations and punctuation marks.
    ---

    🎯 **Your Mission**:
    -   Transform documents into structured, searchable knowledge.
    -   Make document intelligence accessible, clear, and engaging.
    -   Provide fast, accurate answers from documents with proper source attribution.
    -   Respond concisely and professionally, always avoiding technical jargon, raw code, JSON, or internal framework details.
    
    🌐 **Tone & Voice**:
    -   Friendly, clear, and professional — like a helpful, data-savvy friend.
    -   Avoid jargon and keep responses simple, human, and welcoming.
    -   Encourage continued interaction (e.g., "Want to explore more?" or "Need a pie chart for this too?").
    `;

  // --- Tool Choice Logic ---
  let toolChoice: "auto" | "none" | "required" = "auto";
  if (isEmbed) {
    console.log("Embed Mode Debug:", { activeTool, pageContent: !!pageContent, allDocsLen: allDocuments.length });
    if (activeTool === "auto") {
      toolChoice = "auto";
    } else if (activeTool === "current-page" && pageContent) {
      // Use auto to prevent forced loops in multi-step generation
      toolChoice = "auto";
    } else if (activeTool === "knowledge-base" && allDocuments.length > 0) {
      // Use auto to prevent forced loops in multi-step generation
      toolChoice = "auto";
    } else {
      toolChoice =
        allDocuments.length === 0
          ? "none"
          : alwaysUseDocument
          ? "auto" // Changed from required to auto
          : "auto";
    }
  } else {
    toolChoice =
      balance <= 0 || allDocuments.length === 0
        ? "none"
        : userConfigData?.[0]?.useDocument
        ? "required"
        : "auto";
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    toolChoice,
    tools,
    activeTools:
      !isEmbed && userConfigData?.[0]?.useDocument
        ? ["askQuestion", "finish"]
        : undefined,
    system: systemPrompt,
    stopWhen: (result: any) => {
      const steps = result.steps;
      const lastStep = steps?.[steps.length - 1];
      return !!lastStep?.toolCalls?.some((tc: any) => tc.toolName === "finish");
    },
    messages: convertToModelMessages(messages),
    onStepFinish: async (response) => {
      // Only update credits for non-embed users
      if (!isEmbed) {
        const tools = response.toolResults;
        const totalCreditCost = tools?.length || 0;
        if (totalCreditCost > 0 && balance > 0) {
          const newBalance = Math.max(0, balance - totalCreditCost);
          await db
            .update(credits)
            .set({
              balance: newBalance,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(credits.userId, user!.id));
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      const finalMessages = messages as UIMessage[];

      if (isEmbed) {
        // Embed persistence logic
        await db
          .insert(chats)
          .values({
            id: finalChatId,
            messages: finalMessages,
            isKnowledgeBase: true,
            knowledgeBaseId,
            createdAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: chats.id,
            set: {
              messages: finalMessages,
            },
          });

        // Log embed activity
        await serviceSupabase.from("embed_message_logs").insert({
          knowledge_base_id: knowledgeBaseId,
          chat_id: finalChatId,
          message: messages[messages.length - 1].parts[0].text,
          timestamp: new Date().toISOString(),
        });
      } else {
        // App persistence logic
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Error fetching user for persistence:", authError);
          return;
        }

        await db
          .insert(chats)
          .values({
            id: finalChatId,
            messages: finalMessages,
            userId: user.id,
            isKnowledgeBase,
            knowledgeBaseId,
            createdAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: chats.id,
            set: {
              messages: finalMessages,
            },
          });
      }
    },
  });
}
