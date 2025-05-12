// /app/api/pdf/route.ts
import { uploadPDF } from "@/app/utils/pdf/pdfProcessor";
import { NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title") as string;
    if (!file || !(file instanceof Blob) || !title) {
      return new Response(
        JSON.stringify({ error: "File and title are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const nodeFile = new File([arrayBuffer], `${title}.pdf`, {
      type: file.type,
    });
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    const result = await uploadPDF(nodeFile, title, userId);

    return new Response(JSON.stringify({ success: true, message: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to process PDF" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
