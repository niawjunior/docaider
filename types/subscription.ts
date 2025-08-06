// Subscription status types that match our database schema
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

// Subscription plan types
export enum PlanType {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

// Subscription plan interface
export interface Plan {
  id: string;
  name: string;
  description: string;
  type: PlanType;
  price: number;
  currency: string;
  features: string[];
  limits: {
    documents: number;
    knowledgeBases: number;
    documentSize: number; // in MB
    vectorSearches: number;
  };
  stripePriceId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subscription interface
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

// Payment interface
export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_invoice_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  receipt_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
