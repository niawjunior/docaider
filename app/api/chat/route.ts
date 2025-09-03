import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { NextRequest } from "next/server";

import { createClient, createServiceClient } from "../../utils/supabase/server";
import { askQuestionTool } from "@/app/tools/llm-tools";
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
  const { messages, id, isKnowledgeBase, knowledgeBaseId } =
    (await req.json()) as {
      messages: any[];
      id: string;
      isKnowledgeBase: boolean;
      knowledgeBaseId: string;
    };

  // Get the user from the request

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    console.error("User not found");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get all user config using Drizzle ORM
  const userConfigData = await db
    .select({
      useDocument: userConfig.useDocument,
    })
    .from(userConfig)
    .where(eq(userConfig.id, user.id))
    .limit(1);

  // Get user credit using Drizzle ORM
  const [{ balance }] = await db
    .select({ balance: credits.balance })
    .from(credits)
    .where(eq(credits.userId, user.id))
    .limit(1);
  // Get the knowledge base if knowledgeBaseId is provided
  let knowledgeBaseDocumentIds: string[] = [];
  let isPublicKnowledgeBase = false;
  let hasSharedAccess = false;
  const serviceSupabase = createServiceClient();

  try {
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases?.id, knowledgeBaseId));

    // If knowledge base exists, get its document IDs
    if (knowledgeBase) {
      knowledgeBaseDocumentIds = knowledgeBase.documentIds || [];
      isPublicKnowledgeBase = knowledgeBase.isPublic || false;

      // Check if knowledge base is shared with the user's email
      if (
        !isPublicKnowledgeBase &&
        knowledgeBase.userId !== user.id &&
        user.email
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
    } else {
      console.warn(`Knowledge base with ID ${knowledgeBaseId} not found`);
      // If we're in knowledge base mode but the KB doesn't exist, return empty documents
      if (isKnowledgeBase) {
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
    // If we're in knowledge base mode but there was an error, return a 500 error
    if (isKnowledgeBase) {
      return new Response(
        JSON.stringify({ message: "Error fetching knowledge base" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Otherwise continue with empty knowledge base
  }
  // Get documents using Drizzle ORM - only get main document metadata, not chunks
  const allDocuments = await db
    .select({
      id: documents.id,
      documentId: documents.documentId,
      documentName: documents.documentName,
      title: documents.title,
    })
    .from(documents)
    .where(
      isKnowledgeBase && knowledgeBaseId
        ? // If it's a knowledge base request with valid ID and we have documentIds
          and(
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, true),
            // Access control logic:
            // 1. For public knowledge bases, don't filter by user ID
            // 2. For knowledge bases shared with the user's email, don't filter by user ID
            // 3. For private knowledge bases not shared, only show documents owned by the current user
            isPublicKnowledgeBase !== true && hasSharedAccess !== true
              ? eq(documents.userId, user.id)
              : undefined,
            knowledgeBaseDocumentIds.length > 0
              ? inArray(documents.documentId, knowledgeBaseDocumentIds)
              : eq(documents.id, -1) // No matching documents if empty array (impossible condition)
          )
        : // Otherwise use the standard filtering
          and(
            eq(documents.userId, user.id),
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, isKnowledgeBase)
          )
    )
    .orderBy(documents.updatedAt);

  // Get tools
  const tools = {
    askQuestion: askQuestionTool,
  };

  const result = streamText({
    model: openai("gpt-4o-mini"),
    toolChoice:
      balance <= 0 || allDocuments.length === 0
        ? "none"
        : userConfigData?.[0]?.useDocument
        ? "required"
        : "auto",
    tools,
    activeTools: userConfigData?.[0]?.useDocument ? ["askQuestion"] : [],
    system: `
    You are **Docaider** — a polite and friendly AI assistant specializing in Knowledge Management and RAG (Retrieval-Augmented Generation). 
    When replying in Thai:
    - If the user uses “ครับ”, respond with “ครับ”.
    - If the user uses “ค่ะ/คะ”, respond with “ค่ะ/คะ”.
    - If the user does not use polite particles, default to feminine particles (“ค่ะ/คะ”) to match your persona.
    - Your current credit balance is ${balance}.
    🔧 **Tool Selection Guidelines**:
    1.  **Use ONLY ONE tool per message.**
    2.  Choose the most appropriate tool based on the user's explicit request. If not specified inform the user to select a tool first.
    3.  If multiple tools could apply, prioritize the most specific and relevant one.
    4.  If no tool is suitable, respond directly using natural language.
    ‼️ **IMPORTANT Tool Usage Rules**:
    * **Document Questions (askQuestion)**: If the user asks about a document AND documents are available, you **MUST** call the \`askQuestion\` tool.Do NOT provide a generic response or suggest enabling tools if all conditions are met.
    * **Credit Unavailability**: If the credit balance is 0, politely inform the user that tools cannot be used because they don't have enough credit.
    ---

    🧠 **Behavior Guidelines**:

    **General Principles**:
    -   You are a smart girl, polite, and friendly AI assistant.
    -   Always prioritize understanding user intent.
    -   Focus on knowledge extraction, organization, and retrieval from documents.
    -   If user intent is ambiguous, ask clarifying questions instead of guessing.

    **Credit Management**:
    - If the credit balance is 0, politely inform the user that tools cannot be used because they don't have enough credit.
    
    **Knowledge Management**:
    -   For questions about current documents, use the \`askQuestion\` tool.
    -   When a user asks how to upload documents, inform them to check the Documents section in the UI (if they are the knowledge base owner). Otherwise, inform them to contact the knowledge base owner to upload the documents.
    -   Current document count: ${allDocuments.length}
        ** Documents Name:  ${
          allDocuments.length > 0
            ? allDocuments.map((doc) => doc?.title).join(", ")
            : "No documents available."
        } **
     -  **First check if there are documents available. Inform the user to check the Documents section in the UI**
    -   **If current document count is more than 1, you **MUST** Ask user to specify the document name to filter the search.**
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
    -   Respond to the user in Markdown format.
         # Formatting Guidelines
          - Use clear, descriptive headings (## Heading)
          - Use bullet points (•) for lists
          - Use numbered lists (1., 2., etc.) for steps
          - Use backticks (\`) for code snippets
          - Use **bold** for important terms
          - Use *italic* for emphasis

          # Date/Time Handling
          - When answering date-related questions:
            • Today is ${new Date().toISOString()}
            • Always provide accurate dates from the document
            • Maintain chronological order
            • Compare dates relative to current date
            • Format dates consistently (YYYY-MM-DD or full date format)
            • For "next" or "upcoming" questions:
              - Sort dates chronologically
              - Return the first date that's in the future
              - Include days until the event

          # Response Structure
          ## Summary
          - Start with a clear, concise summary
          - Use **bold** for key points

          ## Steps
          1. Numbered steps for procedures
          2. Clear, actionable instructions

          ## Options
          • Bullet points for alternatives
          • Clear separation of ideas

          ## Code
          \`\`\`javascript
          // Example code block
          \`\`\`

          # Tools
          - Use the askQuestion tool to retrieve information
          - Format responses for ReactMarkdown compatibility

          # Examples
          ## Issue Summary
          • Key symptoms
          • Impact on users

          ## Solution Steps
          1. First step
          2. Second step
          3. Verification

          ## Alternative Approaches
          • Option A
          • Option B
          • Considerations for each

    🌐 **Tone & Voice**:
    -   Friendly, clear, and professional — like a helpful, data-savvy friend.
    -   Avoid jargon and keep responses simple, human, and welcoming.
    -   Encourage continued interaction (e.g., "Want to explore more?" or "Need a pie chart for this too?").
    `,
    stopWhen: stepCountIs(1),
    messages: convertToModelMessages(messages),
    onStepFinish: async (response) => {
      const tools = response.toolResults;

      const totalCreditCost = tools?.length || 0;
      if (totalCreditCost > 0) {
        // Update credit using Drizzle ORM
        if (balance > 0) {
          const newBalance = Math.max(0, balance - totalCreditCost);
          await db
            .update(credits)
            .set({
              balance: newBalance,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(credits.userId, user.id));
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      // In AI SDK 5.0, response.messages contains the complete conversation
      const finalMessages = messages;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Error fetching user:", authError);
        return;
      }

      if (!user) {
        console.error("User not found");
        return;
      }

      // Store chat using Drizzle ORM
      await db
        .insert(chats)
        .values({
          id,
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
    },
  });
}
