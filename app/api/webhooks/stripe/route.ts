import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/config";
import { users, subscriptions, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SubscriptionStatus } from "@/types/subscription";

// Helper function to map Stripe subscription status to our database status
function mapStripeStatusToDbStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    case "unpaid":
      return "unpaid";
    default:
      console.warn(
        `Unknown Stripe status: ${stripeStatus}, defaulting to 'incomplete'`
      );
      return "incomplete";
  }
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil" as any, // Type assertion to fix API version mismatch
});

// This is your Stripe webhook secret for testing your endpoint locally
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Handle successful checkout session completion
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (!session.metadata?.userId || !session.subscription) {
    console.error("Missing metadata or subscription in session");
    return;
  }

  const userId = session.metadata.userId;
  const planId = session.metadata.planId;

  // Get the subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Create a new subscription record in our database
  await db.insert(subscriptions).values({
    userId,
    planId,
    stripeSubscriptionId: stripeSubscription.id,
    status: mapStripeStatusToDbStatus(stripeSubscription.status),
    currentPeriodStart: new Date(
      (stripeSubscription as any).current_period_start * 1000
    ).toISOString(),
    currentPeriodEnd: new Date(
      (stripeSubscription as any).current_period_end * 1000
    ).toISOString(),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    metadata: session.metadata,
  });
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription || !invoice.customer) {
    console.error("Missing subscription or customer in invoice");
    return;
  }

  // Find the user by Stripe customer ID
  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, invoice.customer as string),
  });

  if (!user) {
    console.error(`User not found for customer: ${invoice.customer}`);
    return;
  }

  // Find the subscription in our database
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(
      subscriptions.stripeSubscriptionId,
      (invoice as any).subscription as string
    ),
  });

  if (!subscription) {
    console.error(`Subscription not found: ${(invoice as any).subscription}`);
    return;
  }

  // Create a payment record
  // Create payment data with proper type safety
  const paymentData = {
    user_id: user.id,
    subscription_id: subscription.id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id:
      (invoice as any).payment_intent?.toString() || null,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || "paid",
    payment_method:
      Array.isArray((invoice as any).payment_method_types) &&
      (invoice as any).payment_method_types.length > 0
        ? (invoice as any).payment_method_types[0]
        : "unknown",
    receipt_url: invoice.hosted_invoice_url || null,
    metadata: {
      invoiceNumber: invoice.number || "",
      invoicePdf: invoice.invoice_pdf || "",
    },
    created_at: new Date().toISOString(),
  };

  // @ts-expect-error - Type mismatch between schema and interface
  await db.insert(payments).values(paymentData);

  // Update the subscription status if needed
  if (
    invoice.status &&
    subscription.status !== mapStripeStatusToDbStatus(invoice.status)
  ) {
    await db
      .update(subscriptions)
      .set({ status: mapStripeStatusToDbStatus(invoice.status || "paid") })
      .where(eq(subscriptions.id, subscription.id));
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Find the subscription in our database
  const dbSubscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (!dbSubscription) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  // Update the subscription details
  await db
    .update(subscriptions)
    .set({
      status: mapStripeStatusToDbStatus(subscription.status),
      currentPeriodStart: new Date(
        (subscription as any).current_period_start * 1000
      ).toISOString(),
      currentPeriodEnd: new Date(
        (subscription as any).current_period_end * 1000
      ).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.id, dbSubscription.id));
}

// Handle subscription deletions
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find the subscription in our database
  const dbSubscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (!dbSubscription) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  // Update the subscription status to canceled
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.id, dbSubscription.id));
}
