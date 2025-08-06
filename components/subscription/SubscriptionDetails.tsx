"use client";

import { useState } from "react";
import { useSubscription } from "@/app/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { toast } from "sonner";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";

export function SubscriptionDetails() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const supabase = useSupabaseSession();
  const session = supabase.session;
  const userId = session?.user?.id;

  const {
    subscription,
    isLoading,
    error,
    isActive,
    willCancel,
    isCanceled,
    hasProblem,
    currentPlan,
    daysRemaining,
    cancelSubscription,
    resumeSubscription,
  } = useSubscription(userId || "");

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setIsProcessing(true);
      await cancelSubscription.mutateAsync();
      toast("Subscription canceled");
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast("Error canceling subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      setIsProcessing(true);
      await resumeSubscription.mutateAsync();
      toast("Subscription resumed");
    } catch (error: any) {
      console.error("Error resuming subscription:", error);
      toast("Error resuming subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      setIsPortalLoading(true);
      const response = await fetch("/api/customer-portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create customer portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      toast("Error opening customer portal");
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load subscription details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!subscription || isCanceled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don&apos;t have an active subscription. Upgrade to access
            premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Link href="/pricing">
              <Button>View Plans</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </div>
          {isActive && (
            <Badge
              variant={willCancel ? "outline" : "default"}
              className="ml-2"
            >
              {willCancel ? "Canceling" : "Active"}
            </Badge>
          )}
          {hasProblem && (
            <Badge variant="destructive" className="ml-2">
              Payment Issue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">
              {currentPlan?.name || "Unknown Plan"}
            </h3>
            <Badge variant="secondary">{currentPlan?.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {currentPlan?.description || "No description available"}
          </p>
          <div className="flex items-center text-sm">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(currentPlan?.price ? currentPlan.price / 100 : 0)}{" "}
              / {currentPlan?.interval || "month"}
            </span>
          </div>
        </div>

        {/* Billing Period */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Billing Period</h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {subscription.currentPeriodStart
                  ? format(new Date(subscription.currentPeriodStart), "PPP")
                  : "Unknown"}{" "}
                -{" "}
                {subscription.currentPeriodEnd
                  ? format(new Date(subscription.currentPeriodEnd), "PPP")
                  : "Unknown"}
              </span>
            </div>
          </div>
          {isActive && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{daysRemaining} days remaining</span>
                <span>
                  {subscription.currentPeriodEnd
                    ? formatDistanceToNow(
                        new Date(subscription.currentPeriodEnd),
                        {
                          addSuffix: true,
                        }
                      )
                    : "Unknown"}
                </span>
              </div>
              <Progress value={(daysRemaining / 30) * 100} className="h-1" />
            </div>
          )}
        </div>

        {/* Status Messages */}
        {willCancel && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Subscription Canceling</AlertTitle>
            <AlertDescription>
              Your subscription will end on{" "}
              {subscription.currentPeriodEnd
                ? format(
                    new Date(subscription.currentPeriodEnd),
                    "MMMM d, yyyy"
                  )
                : "the end of your billing period"}
              . You can resume your subscription anytime before then.
            </AlertDescription>
          </Alert>
        )}

        {hasProblem && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Issue</AlertTitle>
            <AlertDescription>
              There&apos;s an issue with your payment method. Please update your
              billing information to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex w-full space-x-2">
          {isActive && !willCancel && (
            <Button
              variant="outline"
              onClick={handleCancelSubscription}
              disabled={isProcessing || cancelSubscription.isPending}
              className="flex-1"
            >
              {isProcessing || cancelSubscription.isPending
                ? "Processing..."
                : "Cancel Subscription"}
            </Button>
          )}
          {willCancel && (
            <Button
              variant="default"
              onClick={handleResumeSubscription}
              disabled={isProcessing || resumeSubscription.isPending}
              className="flex-1"
            >
              {isProcessing || resumeSubscription.isPending
                ? "Processing..."
                : "Resume Subscription"}
            </Button>
          )}
          <Link href="/billing/history" className="flex-1">
            <Button variant="outline" className="w-full">
              Billing History
            </Button>
          </Link>
        </div>
        <div className="flex w-full space-x-2">
          <Button
            variant="default"
            onClick={handleOpenCustomerPortal}
            disabled={isPortalLoading || !subscription}
            className="flex-1"
          >
            {isPortalLoading ? "Loading..." : "Manage Payment Methods"}
          </Button>
          <Link href="/pricing" className="flex-1">
            <Button variant="ghost" className="w-full">
              View All Plans
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
