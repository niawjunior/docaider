import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { credits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/credits
 * Retrieves the credit balance for the current user
 */
export async function GET() {
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

    // Query the user's credit using Drizzle ORM
    const result = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, user.id))
      .limit(1);

    // If no credit record is found, create a new one with 50 credits for new users
    if (result.length === 0) {
      const DEFAULT_INITIAL_CREDITS = 50;
      const timestamp = new Date().toISOString();
      
      // Insert new credit record with 50 credits
      const newCredit = await db
        .insert(credits)
        .values({
          userId: user.id,
          balance: DEFAULT_INITIAL_CREDITS,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();
      
      if (newCredit.length === 0) {
        return NextResponse.json(
          { error: "Failed to create initial credit" },
          { status: 500 }
        );
      }
      
      // Return the newly created credit
      return NextResponse.json({
        id: newCredit[0].id,
        user_id: newCredit[0].userId,
        balance: newCredit[0].balance,
        created_at: newCredit[0].createdAt,
        updated_at: newCredit[0].updatedAt,
      });
    }

    // Return the credit information
    return NextResponse.json({
      id: result[0].id,
      user_id: result[0].userId,
      balance: result[0].balance,
      created_at: result[0].createdAt,
      updated_at: result[0].updatedAt,
    });
  } catch (error) {
    console.error("Error fetching credit:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit" },
      { status: 500 }
    );
  }
}
