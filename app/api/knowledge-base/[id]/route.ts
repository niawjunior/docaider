import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { documentChunks, knowledgeBases, documents } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { processKnowledgeBaseDetail } from "@/app/utils/embedding";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { id } = await params;

    // Get the knowledge base
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, id));

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this knowledge base
    let hasAccess = false;

    // Check if knowledge base is public
    if (knowledgeBase.isPublic) {
      hasAccess = true;
    }
    // Check if user is the owner
    else if (session && knowledgeBase.userId === session.user.id) {
      hasAccess = true;
    }
    // Check if knowledge base is shared with the user's email
    else if (session && session.user.email) {
      const { data: sharedAccess } = await serviceSupabase
        .from("knowledge_base_shares")
        .select("id")
        .eq("knowledge_base_id", id)
        .eq("shared_with_email", session.user.email)
        .single();

      if (sharedAccess) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(knowledgeBase);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch knowledge base" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if knowledge base exists and belongs to user
    const [existingKnowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(
        and(
          eq(knowledgeBases.id, id),
          eq(knowledgeBases.userId, session.user.id)
        )
      );

    if (!existingKnowledgeBase) {
      return NextResponse.json(
        {
          error:
            "Knowledge base not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    const { name, detail, isPublic } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Knowledge base name is required" },
        { status: 400 }
      );
    }

    // Update knowledge base
    const [updatedKnowledgeBase] = await db
      .update(knowledgeBases)
      .set({
        name: name.trim(),
        detail: detail?.trim(),
        isPublic: isPublic || false,
        updatedAt: new Date().toISOString(),
        // Preserve isPinned status
      })
      .where(eq(knowledgeBases.id, id))
      .returning();
    console.log("Updated knowledge base:", updatedKnowledgeBase);
    // Generate embedding for detail if provided and changed
    if (updatedKnowledgeBase.detail && updatedKnowledgeBase.detail !== existingKnowledgeBase.detail) {
      console.log("Generating embedding for knowledge base:", updatedKnowledgeBase.id);
      // Run in background
      processKnowledgeBaseDetail(updatedKnowledgeBase.id).catch(console.error);
    }

    return NextResponse.json({ knowledgeBase: updatedKnowledgeBase });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update knowledge base" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if knowledge base exists and belongs to user
    const [existingKnowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(
        and(
          eq(knowledgeBases.id, id),
          eq(knowledgeBases.userId, session.user.id)
        )
      );

    if (!existingKnowledgeBase) {
      return NextResponse.json(
        {
          error:
            "Knowledge base not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    const { name, detail, isPublic, documentIds } = await request.json();

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Only include fields that were provided
    if (name !== undefined) {
      if (!name || name.trim() === "") {
        return NextResponse.json(
          { error: "Knowledge base name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }



    if (detail !== undefined) {
      updateData.detail = detail?.trim();
    }

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    if (documentIds !== undefined) {
      updateData.documentIds = documentIds;
    }

    // Update knowledge base
    const [updatedKnowledgeBase] = await db
      .update(knowledgeBases)
      .set(updateData)
      .where(eq(knowledgeBases.id, id))
      .returning();

    // Generate embedding for detail if provided and changed
    if (updatedKnowledgeBase.detail && updatedKnowledgeBase.detail !== existingKnowledgeBase.detail) {
      // Run in background
      processKnowledgeBaseDetail(updatedKnowledgeBase.id).catch(console.error);
    }

    return NextResponse.json({ knowledgeBase: updatedKnowledgeBase });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update knowledge base" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if knowledge base exists and belongs to user
    const [existingKnowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(
        and(
          eq(knowledgeBases.id, id),
          eq(knowledgeBases.userId, session.user.id)
        )
      );

    if (!existingKnowledgeBase) {
      return NextResponse.json(
        {
          error:
            "Knowledge base not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Implement cascade deletion
    // 1. Get document IDs from the knowledge base
    const documentIds = existingKnowledgeBase.documentIds || [];

    if (documentIds.length > 0) {
      // 2. Get document records using Drizzle ORM
      const documentRecords = await db
        .select()
        .from(documents)
        .where(inArray(documents.documentId, documentIds));

      if (documentRecords.length > 0) {
        // 3. Delete document chunks first (if any)
        await db
          .delete(documentChunks)
          .where(inArray(documentChunks.documentId, documentIds));

        // 4. Delete documents using Drizzle ORM
        await db
          .delete(documents)
          .where(inArray(documents.documentId, documentIds));
      }
    }

    // 5. Finally delete the knowledge base itself
    await db.delete(knowledgeBases).where(eq(knowledgeBases.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting knowledge base:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete knowledge base" },
      { status: 500 }
    );
  }
}
