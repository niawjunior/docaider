import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { userPinnedKnowledgeBases, knowledgeBases, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET - Get all pinned knowledge bases for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pinnedKnowledgeBases = await db
      .select({
        id: knowledgeBases.id,
        name: knowledgeBases.name,
        detail: knowledgeBases.detail,
        isPublic: knowledgeBases.isPublic,
        documentIds: knowledgeBases.documentIds,
        createdAt: knowledgeBases.createdAt,
        updatedAt: knowledgeBases.updatedAt,
        userId: knowledgeBases.userId,
        userName: users.displayName,
        pinnedAt: userPinnedKnowledgeBases.pinnedAt,
        isPinned: sql`true`, // Always true for pinned results
      })
      .from(userPinnedKnowledgeBases)
      .innerJoin(
        knowledgeBases,
        eq(userPinnedKnowledgeBases.knowledgeBaseId, knowledgeBases.id)
      )
      .leftJoin(users, eq(knowledgeBases.userId, users.id))
      .where(eq(userPinnedKnowledgeBases.userId, session.user.id))
      .orderBy(userPinnedKnowledgeBases.pinnedAt);

    return NextResponse.json({ pinnedKnowledgeBases });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch pinned knowledge bases" },
      { status: 500 }
    );
  }
}

// POST - Pin a knowledge base for the current user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { knowledgeBaseId } = await request.json();

    if (!knowledgeBaseId) {
      return NextResponse.json(
        { error: "Knowledge base ID is required" },
        { status: 400 }
      );
    }

    // Check if knowledge base exists and user has access to it
    const knowledgeBase = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, knowledgeBaseId))
      .limit(1);

    if (knowledgeBase.length === 0) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 }
      );
    }

    // Check if user can access this knowledge base (owner or public)
    const kb = knowledgeBase[0];
    if (kb.userId !== session.user.id && !kb.isPublic) {
      return NextResponse.json(
        { error: "You don't have permission to pin this knowledge base" },
        { status: 403 }
      );
    }

    // Check if already pinned
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

    if (existingPin.length > 0) {
      return NextResponse.json(
        { error: "Knowledge base is already pinned" },
        { status: 400 }
      );
    }

    // Create the pin
    const [newPin] = await db
      .insert(userPinnedKnowledgeBases)
      .values({
        userId: session.user.id,
        knowledgeBaseId,
      })
      .returning();

    return NextResponse.json({ pin: newPin });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to pin knowledge base" },
      { status: 500 }
    );
  }
}
