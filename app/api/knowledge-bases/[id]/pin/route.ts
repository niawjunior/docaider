import { NextRequest, NextResponse } from "next/server";
import { knowledgeBases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";

/**
 * Toggle the pinned status of a knowledge base
 * @param request - The request object
 * @param params - The route parameters containing the knowledge base ID
 * @returns A response with the updated knowledge base
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // Get the knowledge base
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, id));

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the knowledge base
    if (knowledgeBase.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You don't own this knowledge base" },
        { status: 403 }
      );
    }

    // Toggle the isPinned status
    const updatedKnowledgeBase = await db
      .update(knowledgeBases)
      .set({
        isPinned: !knowledgeBase.isPinned,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeBases.id, id))
      .returning();

    return NextResponse.json(updatedKnowledgeBase[0]);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    return NextResponse.json(
      { error: "Failed to toggle pin status" },
      { status: 500 }
    );
  }
}
