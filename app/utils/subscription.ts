import { db } from "@/db/config";
import { subscriptions, plans } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type PlanType = "free" | "pro" | "enterprise";

export interface SubscriptionLimits {
  maxDocuments: number;
  maxKnowledgeBases: number;
  maxDocumentSize: number; // in MB
  maxStorage: number; // in MB
  allowedFeatures: string[];
}

// Default limits for each plan type
const planLimits: Record<PlanType, SubscriptionLimits> = {
  free: {
    maxDocuments: 5,
    maxKnowledgeBases: 1,
    maxDocumentSize: 5, // 5MB
    maxStorage: 25, // 25MB
    allowedFeatures: ["basic_chat", "document_upload"],
  },
  pro: {
    maxDocuments: 100,
    maxKnowledgeBases: 20,
    maxDocumentSize: 25, // 25MB
    maxStorage: 500, // 500MB
    allowedFeatures: [
      "basic_chat",
      "document_upload",
      "knowledge_base_sharing",
      "api_access",
      "advanced_analytics",
      "priority_support",
    ],
  },
  enterprise: {
    maxDocuments: 1000,
    maxKnowledgeBases: 100,
    maxDocumentSize: 100, // 100MB
    maxStorage: 5000, // 5GB
    allowedFeatures: [
      "basic_chat",
      "document_upload",
      "knowledge_base_sharing",
      "api_access",
      "advanced_analytics",
      "priority_support",
      "custom_models",
      "team_collaboration",
      "sso_integration",
    ],
  },
};

/**
 * Get the subscription limits for a user based on their plan
 * @param userId The user ID to check
 * @returns The subscription limits for the user's plan
 */
export async function getUserSubscriptionLimits(
  userId: string
): Promise<SubscriptionLimits> {
  try {
    // Get the user's active subscription
    const userSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ),
    });

    // If no active subscription, return free plan limits
    if (!userSubscription) {
      return planLimits.free;
    }

    // Get the plan details
    const planDetails = await db.query.plans.findFirst({
      where: eq(plans.id, userSubscription.planId),
    });

    if (!planDetails) {
      return planLimits.free;
    }

    // Use the plan's custom limits if available, otherwise use the default limits
    const planType = planDetails.type as PlanType;
    const customLimits = planDetails.limits as SubscriptionLimits | null;

    return customLimits || planLimits[planType] || planLimits.free;
  } catch (error) {
    console.error("Error getting subscription limits:", error);
    return planLimits.free; // Default to free plan limits on error
  }
}

/**
 * Check if a user has access to a specific feature based on their subscription
 * @param userId The user ID to check
 * @param feature The feature to check access for
 * @returns Whether the user has access to the feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  try {
    const limits = await getUserSubscriptionLimits(userId);
    return limits.allowedFeatures.includes(feature);
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

/**
 * Check if a user has reached their document limit
 * @param userId The user ID to check
 * @param currentCount The current number of documents the user has
 * @returns Whether the user has reached their document limit
 */
export async function hasReachedDocumentLimit(
  userId: string,
  currentCount: number
): Promise<boolean> {
  try {
    const limits = await getUserSubscriptionLimits(userId);
    return currentCount >= limits.maxDocuments;
  } catch (error) {
    console.error("Error checking document limit:", error);
    return true; // Assume limit reached on error to prevent abuse
  }
}

/**
 * Check if a user has reached their knowledge base limit
 * @param userId The user ID to check
 * @param currentCount The current number of knowledge bases the user has
 * @returns Whether the user has reached their knowledge base limit
 */
export async function hasReachedKnowledgeBaseLimit(
  userId: string,
  currentCount: number
): Promise<boolean> {
  try {
    const limits = await getUserSubscriptionLimits(userId);
    return currentCount >= limits.maxKnowledgeBases;
  } catch (error) {
    console.error("Error checking knowledge base limit:", error);
    return true; // Assume limit reached on error to prevent abuse
  }
}

/**
 * Check if a document size exceeds the user's plan limit
 * @param userId The user ID to check
 * @param sizeInMB The size of the document in MB
 * @returns Whether the document size exceeds the user's plan limit
 */
export async function exceedsDocumentSizeLimit(
  userId: string,
  sizeInMB: number
): Promise<boolean> {
  try {
    const limits = await getUserSubscriptionLimits(userId);
    return sizeInMB > limits.maxDocumentSize;
  } catch (error) {
    console.error("Error checking document size limit:", error);
    return true; // Assume limit exceeded on error to prevent abuse
  }
}
