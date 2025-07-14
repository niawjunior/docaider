import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { documentChunks, knowledgeBases } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
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
    if (
      !knowledgeBase.isPublic &&
      (!session || knowledgeBase.userId !== session.user.id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      knowledgeBase,
    });
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

    const { name, description, isPublic } = await request.json();

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
        description: description?.trim(),
        isPublic: isPublic || false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeBases.id, id))
      .returning();

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

    const { name, description, isPublic, documentIds } = await request.json();

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

    if (description !== undefined) {
      updateData.description = description?.trim();
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
      // 2. Get document records to find their IDs for document_chunks deletion
      const { data: documents, error: docError } = await supabase
        .from("documents")
        .select("id")
        .in("document_id", documentIds);

      if (docError) throw docError;

      const chunkDocIds = documents?.map((doc) => String(doc.id)) || [];

      // 3. Delete document chunks first (if any)

      await db
        .delete(documentChunks)
        .where(inArray(documentChunks.documentId, chunkDocIds));

      // 4. Delete documents
      const { error: docsDeleteError } = await supabase
        .from("documents")
        .delete()
        .in("document_id", documentIds);

      if (docsDeleteError) throw docsDeleteError;
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
