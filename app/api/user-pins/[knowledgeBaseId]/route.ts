import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { userPinnedKnowledgeBases } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// DELETE - Unpin a knowledge base for the current user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ knowledgeBaseId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { knowledgeBaseId } = await params;

    if (!knowledgeBaseId) {
      return NextResponse.json(
        { error: "Knowledge base ID is required" },
        { status: 400 }
      );
    }

    // Check if the pin exists
    const existingPin = await db
      .select()
      .from(userPinnedKnowledgeBases)
      .where(
        and(
          eq(userPinnedKnowledgeBases.userId, session.user.id),
          eq(userPinnedKnowledgeBases.knowledgeBaseId, knowledgeBaseId)
        )
      )
      .limit(1);

    if (existingPin.length === 0) {
      return NextResponse.json(
        { error: "Knowledge base is not pinned" },
        { status: 404 }
      );
    }

    // Delete the pin
    await db
      .delete(userPinnedKnowledgeBases)
      .where(
        and(
          eq(userPinnedKnowledgeBases.userId, session.user.id),
          eq(userPinnedKnowledgeBases.knowledgeBaseId, knowledgeBaseId)
        )
      );

    return NextResponse.json({ message: "Knowledge base unpinned successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to unpin knowledge base" },
      { status: 500 }
    );
  }
}
