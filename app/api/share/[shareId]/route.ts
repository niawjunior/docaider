import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../../db/config";
import { chatShares, chats } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  try {
    // Find the chat ID from the share ID using Drizzle ORM
    const shareData = await db
      .select({
        chatId: chatShares.chatId,
        messages: chatShares.messages,
        createdAt: chatShares.createdAt,
      })
      .from(chatShares)
      .where(eq(chatShares.shareId, shareId))
      .limit(1);

    if (!shareData || shareData.length === 0) {
      return NextResponse.json(
        { error: "Invalid share link" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      chatId: shareData[0].chatId,
      messages: shareData[0].messages,
      createdAt: shareData[0].createdAt,
    });
  } catch (error) {
    console.error("Error fetching shared chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared chat" },
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
