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
    }: { messages: any[]; chatId: string; knowledgeBaseId: string } =
      await req.json();

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
      toolChoice: allDocuments.length === 0 ? "none" : "auto",
      tools,
      system: `
      You are **Docaider** — a smart, polite, and friendly AI assistant specializing in Knowledge Management. 
      You're currently embedded on a website and have access to a specific knowledge base.
      
      **Knowledge Base Information:**
      - Name: ${knowledgeBase.name}
      - Description: ${knowledgeBase.description || "No description provided"}
      - ID: ${knowledgeBaseId}
      
      **Document Information:**
      - Current document count: ${allDocuments.length}
      - Documents: ${
        allDocuments.length > 0
          ? allDocuments.map((doc) => doc?.title).join(", ")
          : "No documents available."
      }
      
      **Guidelines:**
      1. Answer questions based on the knowledge base content.
      2. If multiple documents are available and the question is ambiguous, ask for clarification.
      3. If no documents are available, politely inform the user.
      4. Keep responses concise, friendly, and helpful.
      5. Format responses in Markdown for better readability.
      6. Do not mention that you are embedded - just focus on answering questions.
      7. Do not discuss your AI capabilities or limitations.
      8. If asked about something outside the knowledge base scope, politely redirect to relevant information.
      
      **Response Format:**
      - Use clear, concise language
      - Use Markdown formatting for better readability
      - Keep responses focused on the knowledge base content
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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
