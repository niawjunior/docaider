// /app/api/pdf/route.ts
import { uploadPDF } from "@/app/utils/pdf/pdfProcessor";
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
    const userId = user?.id;

    const result = await uploadPDF(nodeFile, title, userId);

    // Get user credit
    const { data: creditData } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    // update credit
    await supabase
      .from("credits")
      .update({
        balance: creditData?.balance - 1,
      })
      .eq("user_id", user.id);

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
