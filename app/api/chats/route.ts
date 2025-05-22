import { createClient } from "../../utils/supabase/server";
import { NextRequest } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/utils/apiResponse";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  const { data: userData } = await supabase.auth.getUser(); // Renamed to userData to avoid conflict

  if (!userData || !userData.user) {
    // Check for userData and userData.user
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const { data, error } = await supabase
      .from("chats")
      .select("id, created_at, messages")
      .eq("user_id", userData.user.id) // Use userData.user.id
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1); // inclusive

    if (error) {
      console.error("Supabase error fetching chats:", error);
      return createErrorResponse(error.message, 500, "DB_ERROR");
    }

    return createSuccessResponse(data, 200);
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    // Ensure a string message is passed
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch chats";
    return createErrorResponse(errorMessage, 500, "FETCH_CHATS_FAILED");
  }
}
