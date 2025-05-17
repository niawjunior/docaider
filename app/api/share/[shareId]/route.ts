import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const supabase = await createClient();
  const { shareId } = await params;
  try {
    // First, find the chat ID from the share ID
    const { data: shareData, error: shareError } = await supabase
      .from("chat_shares")
      .select("chat_id, messages, created_at")
      .eq("share_id", shareId)
      .single();

    if (shareError || !shareData) {
      return NextResponse.json(
        { error: "Invalid share link" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      chatId: shareData.chat_id,
      messages: shareData.messages.messages,
      createdAt: shareData.created_at,
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
    const supabase = await createClient();
    // Generate a unique share ID
    const shareId = uuidv4();
    const { data: messages, error: messagesError } = await supabase
      .from("chats")
      .select("messages")
      .eq("id", chatId)
      .single();
    if (messagesError) {
      throw messagesError;
    }

    // Create a share record in Supabase
    const { error: shareError } = await supabase
      .from("chat_shares")
      .insert([
        {
          chat_id: chatId,
          share_id: shareId,
          messages: messages,
        },
      ])
      .select();

    if (shareError) {
      throw shareError;
    }

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
