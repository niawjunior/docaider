import { appendResponseMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { NextRequest } from "next/server";

import { createClient } from "../../utils/supabase/server";
import { askQuestionTool } from "@/app/tools/llm-tools";
import { db } from "../../../db/config";
import { credits, documents, chats, knowledgeBases } from "../../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, chatId, currentTool, isKnowledgeBase, knowledgeBaseId } =
    (await req.json()) as {
      messages: any[];
      chatId: string;
      currentTool: string;
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

  console.log("knowledgeBaseId", knowledgeBaseId);
  console.log("isKnowledgeBase", isKnowledgeBase);
  // Get user credit using Drizzle ORM
  const creditData = await db
    .select({ balance: credits.balance })
    .from(credits)
    .where(eq(credits.userId, user.id))
    .limit(1);

  // Get the knowledge base
  const [knowledgeBase] = await db
    .select()
    .from(knowledgeBases)
    .where(eq(knowledgeBases.id, knowledgeBaseId));

  console.log("knowledgeBase", knowledgeBase);

  const knowledgeBaseDocumentIds = knowledgeBase?.documentIds || [];
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
      isKnowledgeBase
        ? // If it's a knowledge base request and we have documentIds, filter by those IDs
          and(
            eq(documents.userId, user.id),
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, true),
            inArray(documents.documentId, knowledgeBaseDocumentIds)
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
      creditData.length === 0 ||
      creditData[0].balance <= 0 ||
      allDocuments.length === 0
        ? "none"
        : currentTool
        ? "required"
        : "auto",
    maxSteps: 1,
    tools,
    system: `
    You are **DocAider** — a smart, polite, and friendly AI assistant specializing in Knowledge Management and RAG (Retrieval-Augmented Generation). Your primary goal is to help users understand, organize, and extract insights from their documents and knowledge bases.
    🔧 **Tool Selection Guidelines**:
    1.  **Use ONLY ONE tool per message.**
    2.  Choose the most appropriate tool based on the user's explicit request. If not specified inform the user to select a tool first.
    3.  If multiple tools could apply, prioritize the most specific and relevant one.
    4.  If no tool is suitable, respond directly using natural language.
    5.  **Current tool**: ${currentTool ? currentTool : "not specified"}
    6.  If current tool is not null, use it.
    ‼️ **IMPORTANT Tool Usage Rules**:
    ** Current document count: ${allDocuments.length} **
    ** Documents Name:  ${
      allDocuments.length > 0
        ? allDocuments
            .map((doc: { title: string } | undefined) => doc?.title)
            .join(", ")
        : "No documents uploaded."
    } **
    * **Document Questions (askQuestion)**: If the user asks about a document AND documents are uploaded, you **MUST** call the \`askQuestion\` tool.Do NOT provide a generic response or suggest enabling tools if all conditions are met.
    * **Tool Unavailability**: If you cannot call a tool due to specific conditions, respond with the exact reason from the options below:
        * "No documents uploaded."
        * "You don't have enough credit."
    ---

    🧠 **Behavior Guidelines**:

    **General Principles**:
    -   Always prioritize understanding user intent.
    -   Focus on knowledge extraction, organization, and retrieval from documents.
    -   If user intent is ambiguous, ask clarifying questions instead of guessing.

    **Credit Management**:
    -   If the credit balance is 0, politely inform the user that tools cannot be used because they don't have enough credit. Use the exact phrase "You don't have enough credit."
    
    **Knowledge Management**:
    -   For questions about uploaded documents, use the \`askQuestion\` tool.
    -   Current document count: ${allDocuments.length}
    -   **If current document count is more than 1, you **MUST** Ask user to specify the document name to filter the search.**
    -   * Always ask the user to specify the language to ask the question. Example: en, th*
    -   Documents Name:  ${
      allDocuments.length > 0
        ? allDocuments
            .map((doc: { title: string } | undefined) => doc?.title)
            .join(", ")
        : "No documents uploaded."
    }
    -   If a document-related tool is requested but document count is 0, politely inform the user: "No documents uploaded."
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

    messages,
    onStepFinish: async (response) => {
      const tools = response.toolResults?.filter(
        (item) => item.type === "tool-result"
      );
      const toolNames = tools?.map((item) => item.toolName);

      const totalCreditCost = toolNames?.length || 0;
      if (totalCreditCost > 0) {
        // Update credit using Drizzle ORM
        if (creditData.length > 0) {
          const newBalance = Math.max(
            0,
            creditData[0].balance - totalCreditCost
          );
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

    async onFinish({ response }) {
      const finalMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

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
          id: chatId,
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

    onError: async (error) => {
      console.error("Error in streamText:", error);
    },
  });

  return result.toDataStreamResponse();
}
