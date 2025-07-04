import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/db/config";
import { credits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * PUT /api/credits/update
 * Updates the credit balance for the current user
 */
export async function PUT(request: Request) {
  try {
    // Parse request body
    const { newBalance } = await request.json();
    
    if (typeof newBalance !== 'number') {
      return NextResponse.json(
        { error: "Invalid balance value" },
        { status: 400 }
      );
    }
    
    // Create server-side Supabase client
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // First check if the user has a credit record
    const existingCredit = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, user.id))
      .limit(1);
    
    let result;
    
    if (existingCredit.length === 0) {
      // Create a new credit record if one doesn't exist
      result = await db
        .insert(credits)
        .values({
          userId: user.id,
          balance: newBalance,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning({ balance: credits.balance });
    } else {
      // Update existing credit record
      result = await db
        .update(credits)
        .set({ 
          balance: newBalance, 
          updatedAt: new Date().toISOString() 
        })
        .where(eq(credits.userId, user.id))
        .returning({ balance: credits.balance });
    }
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Credit update failed" },
        { status: 500 }
      );
    }
    
    // Return the updated balance
    return NextResponse.json({
      balance: result[0].balance
    });
  } catch (error) {
    console.error("Error updating credit:", error);
    return NextResponse.json(
      { error: "Failed to update credit" },
      { status: 500 }
    );
  }
}
