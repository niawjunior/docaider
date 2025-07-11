import { createClient } from "../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/config";
import { chats } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Using Drizzle ORM to fetch chats
    const data = await db.select({
      id: chats.id,
      created_at: chats.createdAt,
      messages: chats.messages
    })
    .from(chats)
    .where(eq(chats.userId, user.user!.id))
    .orderBy(desc(chats.createdAt))
    .limit(limit)
    .offset(offset);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
