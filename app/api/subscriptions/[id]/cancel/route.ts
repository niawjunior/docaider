import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/config";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/app/utils/supabase/server";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST({ params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the subscription from our database
    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.id, id),
        eq(subscriptions.userId, session.user.id)
      ),
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Cancel the subscription at the end of the current period in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update our database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subscriptions.id, id));

    return NextResponse.json({
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
