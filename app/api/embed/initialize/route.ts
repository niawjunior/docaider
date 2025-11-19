import { NextRequest } from "next/server";
import { createServiceClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { knowledgeBases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createChat } from "@/app/utils/aisdk/chat";

export async function POST(req: NextRequest) {
  try {
    const { knowledgeBaseId, referrer } = await req.json();

    if (!knowledgeBaseId) {
      return new Response(
        JSON.stringify({ error: "Knowledge base ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the knowledge base to verify it exists and is public or has embedding enabled
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
    // Public knowledge bases can always be embedded
    // Private knowledge bases need to have embedding explicitly enabled
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

    // Create a new chat session
    const chatId = await createChat();

    // Log the embed access if needed
    const serviceSupabase = createServiceClient();
    await serviceSupabase.from("embed_access_logs").insert({
      knowledge_base_id: knowledgeBaseId,
      chat_id: chatId,
      referrer: referrer || null,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        chatId,
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error initializing embedded chat:", error);
    return new Response(
      JSON.stringify({ error: "Failed to initialize chat" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
