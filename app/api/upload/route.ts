import { uploadFile } from "@/app/utils/file/fileProcessor";
import { checkDuplicateTitle } from "@/app/utils/file/checkDuplicateTitle";
import { NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "../../../db/config";
import { credits } from "../../../db/schema";
import { eq } from "drizzle-orm";

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
    
    // Check if a document with the same title already exists for this user
    const isDuplicate = await checkDuplicateTitle(title, user.id);
    if (isDuplicate) {
      return new Response(
        JSON.stringify({ 
          error: "A document with this title already exists. Please use a different title." 
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

    const result = await uploadFile(nodeFile, title, userId);

    // Get user credit using Drizzle ORM
    const creditData = await db.select({ balance: credits.balance })
      .from(credits)
      .where(eq(credits.userId, user.id))
      .limit(1);
      
    if (creditData.length === 0) {
      return new Response(JSON.stringify({ error: "Credit not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Update credit using Drizzle ORM
    await db.update(credits)
      .set({ 
        balance: creditData[0].balance - 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(credits.userId, user.id));

    return new Response(JSON.stringify({ success: true, message: result }), {
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
