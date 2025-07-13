import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { knowledgeBases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPublic } = await request.json();

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
        description: description?.trim(),
        isPublic: isPublic || false,
        userId: session.user.id,
      })
      .returning();

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
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const url = new URL(request.url);
    const isPublic = url.searchParams.get("isPublic") === "true";

    // If requesting public knowledge bases, no auth needed
    // If requesting private knowledge bases, auth required
    if (!isPublic && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query: any = db.select().from(knowledgeBases);

    if (isPublic) {
      query = query.where(eq(knowledgeBases.isPublic, true));
    } else if (session) {
      query = query.where(eq(knowledgeBases.userId, session.user.id));
    }

    const knowledgeBaseList = await query.orderBy(knowledgeBases.createdAt);

    return NextResponse.json({ knowledgeBases: knowledgeBaseList });
  } catch (error: any) {
    console.error("Error fetching knowledge bases:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch knowledge bases" },
      { status: 500 }
    );
  }
}
