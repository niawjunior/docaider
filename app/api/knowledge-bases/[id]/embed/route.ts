import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { knowledgeBases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // Get the user from the session
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const { allowEmbedding, embedConfig } = await request.json();

    // Create a Supabase client

    // Check if the knowledge base exists and if the user is the owner
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, id))
      .limit(1);

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the knowledge base
    if (knowledgeBase.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the knowledge base with the new embedding settings
    const [updatedKnowledgeBase] = await db
      .update(knowledgeBases)
      .set({
        allowEmbedding:
          allowEmbedding !== undefined
            ? allowEmbedding
            : knowledgeBase.allowEmbedding,
        embedConfig:
          embedConfig !== undefined ? embedConfig : knowledgeBase.embedConfig,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeBases.id, id))
      .returning();

    return NextResponse.json({
      message: "Embed settings updated successfully",
      data: {
        allowEmbedding: updatedKnowledgeBase.allowEmbedding,
        embedConfig: updatedKnowledgeBase.embedConfig,
      },
    });
  } catch (error) {
    console.error("Error updating embed settings:", error);
    return NextResponse.json(
      { error: "Failed to update embed settings" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if the knowledge base exists
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, id))
      .limit(1);

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 }
      );
    }

    // Return the embedding settings
    return NextResponse.json({
      data: {
        allowEmbedding: knowledgeBase.allowEmbedding,
        embedConfig: knowledgeBase.embedConfig,
      },
    });
  } catch (error) {
    console.error("Error fetching embed settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch embed settings" },
      { status: 500 }
    );
  }
}
