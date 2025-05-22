import { createClient } from "@/app/utils/supabase/server";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }, // shareId here is the share_token from chat_shares
) {
  const supabase = await createClient();
  const { shareId } = await params;

  if (!shareId) {
    return createErrorResponse(
      "Share ID (token) is required",
      400,
      "VALIDATION_ERROR",
    );
  }

  try {
    const { data: shareData, error: shareError } = await supabase
      .from("chat_shares") // Table containing share_id and associated chat_id/messages
      .select("chat_id, messages, created_at")
      .eq("share_id", shareId) // Query by the share_id (token)
      .single();

    if (shareError) {
      // Check if the error is because the share_id was not found
      if (shareError.code === "PGRST116") {
        // PGRST116: No rows found
        return createErrorResponse(
          "Invalid or expired share link",
          404,
          "NOT_FOUND",
        );
      }
      console.error("Error fetching shared chat by share_id:", shareError);
      return createErrorResponse(
        "Failed to retrieve shared chat",
        500,
        "DB_ERROR",
      );
    }

    if (!shareData) {
      // Should be caught by shareError.code PGRST116, but as a safeguard
      return createErrorResponse("Shared chat not found", 404, "NOT_FOUND");
    }

    // Assuming shareData.messages already contains the messages in the desired format
    // If shareData.messages is a JSONB column with a specific structure like { messages: [...] }
    // then access it as shareData.messages.messages as in original code.
    // For this refactor, let's assume shareData.messages is the direct array/object.
    const messagesToReturn = shareData.messages?.messages || shareData.messages;

    return createSuccessResponse(
      {
        chatId: shareData.chat_id,
        messages: messagesToReturn, // Use the potentially unwrapped messages
        createdAt: shareData.created_at, // This is the timestamp of when the share link was created
      },
      200,
    );
  } catch (error) {
    console.error("Unexpected error fetching shared chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return createErrorResponse(errorMessage, 500, "UNEXPECTED_ERROR");
  }
}

// This POST route seems to be intended to be called with a chatId to create a share link.
// The route parameter `[shareId]` might be misleading if it's not used as `share_id` for POST.
// If POST is to `/api/share/{chatId}`, the parameter name should reflect that.
// Assuming the current file structure `app/api/share/[shareId]/route.ts` means `params.shareId` is the `chatId` for POST.
export async function POST(
  req: NextRequest,
  // If the intention is that `params.shareId` is the `chatId` for this POST operation:
  { params }: { params: Promise<{ shareId: string }> },
) {
  const supabase = await createClient();
  const { shareId: chatIdFromParams } = await params; // param is used as chatId

  // Additionally, check if chatId is passed in body, prioritize param if both exist.
  let reqBody;
  try {
    reqBody = await req.json();
  } catch (e) {
    // Ignore error if body is empty or not JSON, rely on param or handle as needed
    reqBody = {};
  }

  const chatId = chatIdFromParams || reqBody.chatId;

  if (!chatId) {
    return createErrorResponse(
      "Chat ID is required to create a share link",
      400,
      "VALIDATION_ERROR_CHATID",
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return createErrorResponse(
      "Unauthorized: User not authenticated",
      401,
      "UNAUTHORIZED",
    );
  }

  try {
    // Verify the user owns the chat they are trying to share (optional but good practice)
    const { data: chatOwnerData, error: chatOwnerError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", authData.user.id)
      .single();

    if (chatOwnerError || !chatOwnerData) {
      return createErrorResponse(
        "Chat not found or user does not have access to share this chat",
        404,
        "NOT_FOUND_OR_FORBIDDEN",
      );
    }

    const newShareToken = uuidv4(); // This is the share_id for the chat_shares table

    const { data: chatMessages, error: messagesError } = await supabase
      .from("chats")
      .select("messages") // Select the messages column which is JSONB
      .eq("id", chatId)
      .single();

    if (messagesError || !chatMessages) {
      console.error("Error fetching messages for chat:", messagesError);
      return createErrorResponse(
        "Failed to fetch chat messages for sharing",
        500,
        "DB_ERROR_MESSAGES",
      );
    }

    // Create a share record in Supabase `chat_shares` table
    // Upsert based on chat_id to either create a new share link or update the existing one's share_id (token)
    const { data: shareOperationData, error: shareError } = await supabase
      .from("chat_shares")
      .upsert(
        {
          chat_id: chatId,
          share_id: newShareToken, // The new unique token for sharing
          messages: chatMessages.messages, // Store the actual messages JSON/JSONB object
          user_id: authData.user.id, // Store who created/updated this share link
          // created_at is handled by db default, updated_at can be set manually if needed via .rpc or trigger
        },
        {
          onConflict: "chat_id", // If a share link for this chat_id already exists, update it
        },
      )
      .select("share_id, created_at") // Select the relevant fields after upsert
      .single();

    if (shareError || !shareOperationData) {
      console.error("Error creating/updating share record:", shareError);
      return createErrorResponse(
        "Failed to create or update share link in database",
        500,
        "DB_UPSERT_ERROR",
      );
    }

    return createSuccessResponse(
      {
        shareId: shareOperationData.share_id, // This is the token clients use
        shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${shareOperationData.share_id}`,
        createdAt: shareOperationData.created_at, // Timestamp of the share link creation/update
      },
      201,
      "Share link created/updated successfully",
    );
  } catch (error) {
    console.error("Unexpected error creating share link:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return createErrorResponse(errorMessage, 500, "UNEXPECTED_SHARE_ERROR");
  }
}
