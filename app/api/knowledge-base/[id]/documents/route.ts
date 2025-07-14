import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { knowledgeBases, documents } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { id } = await params;
    // console.log("id", id);

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

    // Get documents that belong to this knowledge base based on documentIds array
    // Check if knowledgeBase has documentIds
    if (!knowledgeBase.documentIds || knowledgeBase.documentIds.length === 0) {
      return NextResponse.json({ documents: [] });
    }

    // The documentIds are stored in the knowledge base

    // Get all documents that have this knowledge base ID as their documentId
    const kbDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        userId: documents.userId,
        documentId: documents.documentId,
        documentName: documents.documentName,
        isKnowledgeBase: documents.isKnowledgeBase,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        url: documents.url,
      })
      .from(documents)
      .where(inArray(documents.documentId, knowledgeBase.documentIds))
      .orderBy(documents.updatedAt);

    return NextResponse.json({ documents: kbDocuments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch knowledge base documents" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
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
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(
        and(
          eq(knowledgeBases.id, id),
          eq(knowledgeBases.userId, session.user.id)
        )
      );

    if (!knowledgeBase) {
      return NextResponse.json(
        {
          error:
            "Knowledge base not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Verify that the document belongs to the user
    const [userDocument] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.userId, session.user.id),
          eq(documents.id, parseInt(documentId))
        )
      );

    if (!userDocument) {
      return NextResponse.json(
        {
          error: "Document not found or you don't have permission to add it",
        },
        { status: 400 }
      );
    }

    // Check if document is already in the knowledge base
    const [existingDoc] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.documentId, id),
          eq(documents.id, parseInt(documentId))
        )
      );

    if (existingDoc) {
      return NextResponse.json(
        { message: "Document is already in the knowledge base" },
        { status: 200 }
      );
    }

    // Update document to associate it with this knowledge base
    await db
      .update(documents)
      .set({
        documentId: id, // Set the documentId field to the knowledge base ID
        isKnowledgeBase: true, // Mark as a knowledge base document
      })
      .where(eq(documents.id, parseInt(documentId)));

    // Also update the knowledge base's documentIds array
    const [currentKB] = await db
      .select({ documentIds: knowledgeBases.documentIds })
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, id));

    const currentDocIds = currentKB.documentIds || [];
    const updatedDocIds = [...currentDocIds, documentId];

    await db
      .update(knowledgeBases)
      .set({
        documentIds: updatedDocIds,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeBases.id, id));

    return NextResponse.json({
      success: true,
      message: "Document added to knowledge base successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add documents to knowledge base" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { id } = await params;
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Check if knowledge base exists and belongs to user
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(
        and(
          eq(knowledgeBases.id, id),
          eq(knowledgeBases.userId, session.user.id)
        )
      );

    if (!knowledgeBase) {
      return NextResponse.json(
        {
          error:
            "Knowledge base not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    // Remove document from knowledge base by clearing the documentId field
    await db
      .update(documents)
      .set({
        documentId: null, // Clear the documentId field
        isKnowledgeBase: false, // No longer a knowledge base document
      })
      .where(
        and(
          eq(documents.documentId, id),
          eq(documents.id, parseInt(documentId))
        )
      );

    // Also update the knowledge base's documentIds array
    const [currentKB] = await db
      .select({ documentIds: knowledgeBases.documentIds })
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, id));

    const currentDocIds = currentKB.documentIds || [];
    const updatedDocIds = currentDocIds.filter((docId) => docId !== documentId);

    await db
      .update(knowledgeBases)
      .set({
        documentIds: updatedDocIds,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeBases.id, id));

    return NextResponse.json({
      success: true,
      message: "Document removed from knowledge base successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to remove document from knowledge base",
      },
      { status: 500 }
    );
  }
}
