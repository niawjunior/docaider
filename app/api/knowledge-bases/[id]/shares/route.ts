import { createClient, createServiceClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { knowledgeBaseShares } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get all shares for a knowledge base
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knowledgeBaseId = id;

    // Check if user owns the knowledge base
    const { data: knowledgeBase } = await supabase
      .from("knowledge_bases")
      .select("user_id")
      .eq("id", knowledgeBaseId)
      .eq("user_id", user.id)
      .single();

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: "Knowledge base not found or access denied" },
        { status: 404 }
      );
    }

    // Get all shares for this knowledge base
    const shares = await db
      .select({
        id: knowledgeBaseShares.id,
        sharedWithEmail: knowledgeBaseShares.sharedWithEmail,
        sharedByUserId: knowledgeBaseShares.sharedByUserId,
        createdAt: knowledgeBaseShares.createdAt,
      })
      .from(knowledgeBaseShares)
      .where(eq(knowledgeBaseShares.knowledgeBaseId, knowledgeBaseId))
      .orderBy(desc(knowledgeBaseShares.createdAt));

    return NextResponse.json({ shares });
  } catch (error) {
    console.error("Error in GET /api/knowledge-bases/[id]/shares:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a new share
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knowledgeBaseId = params.id;
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if user owns the knowledge base
    const { data: knowledgeBase } = await supabase
      .from("knowledge_bases")
      .select("user_id")
      .eq("id", knowledgeBaseId)
      .eq("user_id", user.id)
      .single();

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: "Knowledge base not found or access denied" },
        { status: 404 }
      );
    }

    // Use service client for database operations to bypass RLS
    const serviceSupabase = createServiceClient();

    // Add the share
    const { data: newShare, error } = await serviceSupabase
      .from("knowledge_base_shares")
      .insert({
        knowledge_base_id: knowledgeBaseId,
        shared_with_email: email.toLowerCase(),
        shared_by_user_id: user.id,
      })
      .select("id, shared_with_email, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "This email is already shared with this knowledge base" },
          { status: 409 }
        );
      }
      console.error("Error creating share:", error);
      return NextResponse.json(
        { error: "Failed to create share" },
        { status: 500 }
      );
    }

    return NextResponse.json({ share: newShare });
  } catch (error) {
    console.error("Error in POST /api/knowledge-bases/[id]/shares:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a share
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knowledgeBaseId = params.id;
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    // Use service client for database operations to bypass RLS
    const serviceSupabase = createServiceClient();

    // Check if user owns the knowledge base and the share
    const { data: share } = await serviceSupabase
      .from("knowledge_base_shares")
      .select("id, knowledge_base_id")
      .eq("id", shareId)
      .eq("knowledge_base_id", knowledgeBaseId)
      .eq("shared_by_user_id", user.id)
      .single();

    if (!share) {
      return NextResponse.json(
        { error: "Share not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the share
    const { error } = await serviceSupabase
      .from("knowledge_base_shares")
      .delete()
      .eq("id", shareId);

    if (error) {
      console.error("Error deleting share:", error);
      return NextResponse.json(
        { error: "Failed to delete share" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Share deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/knowledge-bases/[id]/shares:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
