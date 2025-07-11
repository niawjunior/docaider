import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * DELETE /api/documents/[documentId]
 * Deletes a document and its file from storage
 */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string; documentName: string }> }
) {
  const { documentId, documentName } = await params;

  try {
    // Create server-side Supabase client
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete the file from Supabase storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([`user_${user.id}/${documentName}`]);

    if (storageError) {
      console.error("Storage error:", storageError);
      return NextResponse.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    // 2. Delete document from database using Drizzle ORM
    await db.delete(documents).where(eq(documents.documentId, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
