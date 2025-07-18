import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import { db } from "../../../db/config";
import { chats, chatShares } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get chatId from query params
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  try {
    // Use Drizzle ORM to query the chat_shares table
    const shares = await db
      .select({
        shareId: chatShares.shareId,
        createdAt: chatShares.createdAt,
        messages: chatShares.messages,
      })
      .from(chatShares)
      .where(eq(chatShares.chatId, chatId))
      .orderBy(desc(chatShares.createdAt))
      .limit(1);

    if (shares && shares.length > 0) {
      return NextResponse.json({
        shareId: shares[0].shareId,
        shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${shares[0].shareId}`,
        createdAt: shares[0].createdAt,
      });
    } else {
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error("Error fetching share data:", error);
    return NextResponse.json(
      { error: "Failed to fetch share data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    // Generate a unique share ID
    const shareId = uuidv4();

    // First get the messages using Drizzle ORM
    const messages = await db
      .select({ messages: chats.messages })
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);

    if (!messages || messages.length === 0) {
      throw new Error("Chat not found");
    }

    // Create a share record using Drizzle ORM
    await db.insert(chatShares).values({
      chatId: chatId,
      shareId: shareId,
      messages: messages[0].messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      shareId,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${shareId}`,
    });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
