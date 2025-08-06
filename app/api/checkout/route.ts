import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/config";
import { users, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/app/utils/supabase/server";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the price ID from the request body
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a Stripe customer if one doesn't exist
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, user.id));
    }

    // Get the plan details from the database
    const plan = await db.query.plans.findFirst({
      where: eq(plans.stripePriceId, priceId),
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        planType: plan.type,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
