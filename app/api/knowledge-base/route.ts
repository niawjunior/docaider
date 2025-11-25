import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { knowledgeBases, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { processKnowledgeBaseDetail } from "@/app/utils/embedding";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, detail, isPublic } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Knowledge base name is required" },
        { status: 400 }
      );
    }

    // Create knowledge base
    const [knowledgeBase] = await db
      .insert(knowledgeBases)
      .values({
        name: name.trim(),
        detail: detail?.trim(),
        isPublic: isPublic || false,
        userId: session.user.id,
      })
      .returning();

    // Generate embedding for detail if provided
    if (knowledgeBase.detail) {
      // Run in background
      processKnowledgeBaseDetail(knowledgeBase.id).catch(console.error);
    }

    return NextResponse.json({ knowledgeBase }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating knowledge base:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create knowledge base" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const isPublic = url.searchParams.get("isPublic") === "true";
    // For public knowledge bases, we don't need authentication
    if (isPublic) {
      // Query public knowledge bases with user display names using simple join
      // This works now because RLS policy allows public access to user profile info
      const publicKnowledgeBases = await db
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
        })
        .from(knowledgeBases)
        .leftJoin(users, eq(knowledgeBases.userId, users.id))
        .where(eq(knowledgeBases.isPublic, true))
        .orderBy(knowledgeBases.createdAt);

      return NextResponse.json({ knowledgeBases: publicKnowledgeBases });
    }

    // For private knowledge bases, we need authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query user's knowledge bases
    const userKnowledgeBases = await db
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
      })
      .from(knowledgeBases)
      .leftJoin(users, eq(knowledgeBases.userId, users.id))
      .where(eq(knowledgeBases.userId, session.user.id))
      .orderBy(knowledgeBases.createdAt);

    return NextResponse.json({ knowledgeBases: userKnowledgeBases });
  } catch (error: any) {
    console.error("Error fetching knowledge bases:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch knowledge bases" },
      { status: 500 }
    );
  }
}
