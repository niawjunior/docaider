import { uploadFile } from "@/app/utils/file/fileProcessor";
import { checkDuplicateTitle } from "@/app/utils/file/checkDuplicateTitle";
import { NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    console.error("User not found");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title") as string;
    const isKnowledgeBase = formData.get("isKnowledgeBase") === "true";
    if (!file || !(file instanceof Blob) || !title) {
      return new Response(
        JSON.stringify({ error: "File and title are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if a document with the same title already exists for this user
    const isDuplicate = await checkDuplicateTitle(title, user.id, isKnowledgeBase);
    if (isDuplicate) {
      return new Response(
        JSON.stringify({
          error:
            "A document with this title already exists. Please use a different title.",
        }),
        {
          status: 409, // Conflict status code
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileExtension = file.name.split(".").pop();
    const nodeFile = new File([arrayBuffer], `${title}.${fileExtension}`, {
      type: file.type,
    });
    const userId = user?.id;

    const result = await uploadFile(nodeFile, title, userId, isKnowledgeBase);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing File:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to process File" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
