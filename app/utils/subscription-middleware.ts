import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/config";
import { subscriptions, plans } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type PlanType = "free" | "basic" | "premium" | "enterprise";

/**
 * Middleware to check if a user has an active subscription of the required plan type
 * @param req The Next.js request object
 * @param requiredPlanTypes Array of plan types that are allowed to access the route
 * @returns NextResponse with redirect or the original request
 */
export async function requireSubscription(
  req: NextRequest,
  requiredPlanTypes: PlanType[] = ["basic", "premium", "enterprise"],
  userId: string
): Promise<NextResponse> {
  try {
    // Get the user's active subscription
    const userSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ),
    });

    // If no active subscription, check if free plan is allowed
    if (!userSubscription) {
      if (requiredPlanTypes.includes("free")) {
        return NextResponse.next();
      }

      // Redirect to pricing page
      const redirectUrl = new URL("/pricing", req.url);
      redirectUrl.searchParams.set("requiredPlan", requiredPlanTypes[0]);
      return NextResponse.redirect(redirectUrl);
    }

    // Get the plan details
    const planDetails = await db.query.plans.findFirst({
      where: eq(plans.id, userSubscription.planId),
    });

    if (!planDetails) {
      // Redirect to pricing page if plan not found
      const redirectUrl = new URL("/pricing", req.url);
      redirectUrl.searchParams.set("requiredPlan", requiredPlanTypes[0]);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if the user's plan type is in the required plan types
    if (requiredPlanTypes.includes(planDetails.type as PlanType)) {
      return NextResponse.next();
    }

    // Redirect to pricing page if plan type not allowed
    const redirectUrl = new URL("/pricing", req.url);
    redirectUrl.searchParams.set("requiredPlan", requiredPlanTypes[0]);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in subscription middleware:", error);

    // Redirect to error page on error
    const redirectUrl = new URL("/error", req.url);
    redirectUrl.searchParams.set("message", "Subscription check failed");
    return NextResponse.redirect(redirectUrl);
  }
}
