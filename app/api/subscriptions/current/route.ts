import { NextResponse } from "next/server";
import { db } from "@/db/config";
import { subscriptions, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/app/utils/supabase/server";

export async function GET() {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's active subscription
    const userSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, session.user.id),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });

    if (!userSubscription) {
      return NextResponse.json(null);
    }

    // Get the plan details
    const planDetails = await db.query.plans.findFirst({
      where: eq(plans.id, userSubscription.planId),
    });

    // Return the subscription with plan details
    return NextResponse.json({
      ...userSubscription,
      plan: planDetails,
    });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
