import { createClient } from "../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server"; // Keep NextResponse for non-utility cases if any
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const supabase = await createClient();
  const { chatId } = await params;

  if (!chatId) {
    // Added check for chatId
    return createErrorResponse(
      "Chat ID is required",
      400,
      "VALIDATION_ERROR_CHATID",
    );
  }

  const { data: authData } = await supabase.auth.getUser(); // Renamed to authData

  if (!authData || !authData.user) {
    // Check authData and authData.user
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const { data: chatMessagesData, error } = await supabase // Renamed to chatMessagesData
      .from("chats")
      .select("messages")
      .eq("id", chatId)
      .eq("user_id", authData.user.id) // Use authData.user.id
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Specific check for "No rows found"
        return createErrorResponse(
          "Chat not found or access denied",
          404,
          "NOT_FOUND",
        );
      }
      console.error("Error fetching chat messages by ID:", error);
      return createErrorResponse(
        error.message || "Failed to fetch chat messages",
        500,
        "DB_FETCH_ERROR",
      );
    }

    // If single() is used and no error, data should exist.
    // The previous !data check is redundant if PGRST116 is handled.
    // However, being explicit is fine.
    if (!chatMessagesData) {
      return createErrorResponse("Chat not found", 404, "NOT_FOUND_UNEXPECTED"); // Should ideally be caught by PGRST116
    }

    // Assuming data.messages is the array of messages
    return createSuccessResponse(chatMessagesData.messages, 200);
  } catch (error) {
    console.error("Unexpected error fetching chat by ID:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return createErrorResponse(errorMessage, 500, "UNEXPECTED_FETCH_ERROR");
  }
}
