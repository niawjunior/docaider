import { createClient } from "../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db/config";
import { chats } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const supabase = await createClient();
  const { chatId } = await params;

  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("user", user);
  console.log("chatId", chatId);

  try {
    const data = await db
      .select({
        messages: chats.messages,
      })
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, user!.user!.id)))
      .limit(1);

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    if (!data) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(data[0].messages); // returns an array of messages
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}
