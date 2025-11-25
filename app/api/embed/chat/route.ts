import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { createServiceClient } from "@/app/utils/supabase/server";
import { embedAskQuestionTool } from "@/app/tools/embed-tools";
import { db } from "@/db/config";
import { chats, knowledgeBases, documents } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      chatId,
      knowledgeBaseId,
      alwaysUseDocument,
    }: {
      messages: any[];
      chatId: string;
      knowledgeBaseId: string;
      alwaysUseDocument: boolean;
    } = await req.json();

    console.log("alwaysUseDocument: ", alwaysUseDocument);

    if (!chatId || !knowledgeBaseId) {
      return new Response(
        JSON.stringify({
          error: "Chat ID and knowledge base ID are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the knowledge base
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, knowledgeBaseId));

    if (!knowledgeBase) {
      return new Response(
        JSON.stringify({ error: "Knowledge base not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if embedding is allowed for this knowledge base
    if (!knowledgeBase.isPublic && !knowledgeBase.allowEmbedding) {
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

    // Get knowledge base documents
    const knowledgeBaseDocumentIds = knowledgeBase.documentIds || [];

    // Get documents
    const allDocuments = await db
      .select({
        id: documents.id,
        documentId: documents.documentId,
        documentName: documents.documentName,
        title: documents.title,
      })
      .from(documents)
      .where(
        and(
          eq(documents.active, true),
          eq(documents.isKnowledgeBase, true),
          knowledgeBaseDocumentIds.length > 0
            ? inArray(documents.documentId, knowledgeBaseDocumentIds)
            : eq(documents.id, -1) // No matching documents if empty array
        )
      )
      .orderBy(documents.updatedAt);

    // Get tools - using embed-specific tool that doesn't require authentication
    const tools = {
      askQuestion: embedAskQuestionTool,
    };

    // Create the stream response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      toolChoice:
        allDocuments.length === 0
          ? "none"
          : alwaysUseDocument
          ? "required"
          : "auto",
      tools,
      system: `
       - When replying in Thai:
      • Use **ค่ะ** at the end of **statements**.  
      • Use **คะ** at the end of **questions**.  
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
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages }) => {
        // In AI SDK 5.0, response.messages contains the complete conversation
        const finalMessages: UIMessage[] = messages as UIMessage[];
        const serviceSupabase = createServiceClient();

        // Update the chat with the new messages
        await db
          .insert(chats)
          .values({
            id: chatId,
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

        // Log the chat activity
        await serviceSupabase.from("embed_message_logs").insert({
          knowledge_base_id: knowledgeBaseId,
          chat_id: chatId,
          message: messages[messages.length - 1].parts[0].text,
          timestamp: new Date().toISOString(),
        });
      },
    });
  } catch (error) {
    console.error("Error in embedded chat:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
