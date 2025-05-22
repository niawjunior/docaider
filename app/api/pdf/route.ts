// /app/api/pdf/route.ts
import { uploadPDF } from "@/app/utils/pdf/pdfProcessor";
import { NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    console.error("User not found");
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title") as string;
    if (!file || !(file instanceof Blob) || !title) {
      return createErrorResponse(
        "File and title are required",
        400,
        "VALIDATION_ERROR",
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const nodeFile = new File([arrayBuffer], `${title}.pdf`, {
      type: file.type,
    });
    const userId = user?.id;

    const result = await uploadPDF(nodeFile, title, userId);

    // Get user credit
    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (creditError || !creditData) {
      console.error("Error fetching credits:", creditError);
      return createErrorResponse(
        "Failed to fetch user credits.",
        500,
        "CREDIT_FETCH_FAILED",
      );
    }

    if (creditData.balance <= 0) {
      return createErrorResponse(
        "Insufficient credits to upload document.",
        402,
        "INSUFFICIENT_CREDITS",
      );
    }

    // update credit
    const { error: updateCreditError } = await supabase
      .from("credits")
      .update({
        balance: creditData?.balance - 1,
      })
      .eq("user_id", user.id);

    if (updateCreditError) {
      console.error("Error updating credits:", updateCreditError);
      // Decide if this is a hard failure or if the upload can still be considered successful
      // For now, let's assume it's not a hard failure for the upload itself, but log it.
      // Depending on business logic, you might want to return an error here.
    }

    // The `result` from `uploadPDF` seems to be a message string based on original code.
    // If it's meant to be data, structure it as { uploadResult: result }
    return createSuccessResponse(
      { message: result as string },
      200,
      "Document uploaded successfully",
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    return createErrorResponse(
      (error as Error).message || "Failed to process PDF",
      500,
      "PDF_PROCESSING_FAILED",
    );
  }
}
