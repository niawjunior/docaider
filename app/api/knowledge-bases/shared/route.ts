import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { knowledgeBases, knowledgeBaseShares, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get knowledge bases shared with the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Get knowledge bases shared with this user's email
    const sharedKnowledgeBases = await db
      .select({
        id: knowledgeBases.id,
        title: knowledgeBases.name,
        detail: knowledgeBases.detail,
        isPublic: knowledgeBases.isPublic,
        createdAt: knowledgeBases.createdAt,
        updatedAt: knowledgeBases.updatedAt,
        userId: knowledgeBases.userId,
        sharedByEmail: users.email,
        sharedAt: knowledgeBaseShares.createdAt,
      })
      .from(knowledgeBaseShares)
      .innerJoin(
        knowledgeBases,
        eq(knowledgeBaseShares.knowledgeBaseId, knowledgeBases.id)
      )
      .innerJoin(users, eq(knowledgeBaseShares.sharedByUserId, users.id))
      .where(eq(knowledgeBaseShares.sharedWithEmail, email.toLowerCase()));

    return NextResponse.json({ sharedKnowledgeBases });
  } catch (error) {
    console.error("Error in GET /api/knowledge-bases/shared:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
