import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useSubscription(userId: string) {
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return null;

      const response = await fetch("/api/subscriptions/current");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    enabled: !!userId,
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!subscription?.id) {
        throw new Error("No active subscription to cancel");
      }

      const response = await fetch(
        `/api/subscriptions/${subscription.id}/cancel`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", userId],
      });
    },
  });

  const resumeSubscription = useMutation({
    mutationFn: async () => {
      if (!subscription?.id) {
        throw new Error("No subscription to resume");
      }

      const response = await fetch(
        `/api/subscriptions/${subscription.id}/resume`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resume subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", userId],
      });
    },
  });

  // Check if the user has an active subscription
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  // Check if the subscription is set to cancel at period end
  const willCancel = subscription?.cancelAtPeriodEnd === true;

  // Check if the subscription is already canceled
  const isCanceled = subscription?.status === "canceled";

  // Check if the subscription is in a problem state
  const hasProblem = [
    "past_due",
    "unpaid",
    "incomplete",
    "incomplete_expired",
  ].includes(subscription?.status || "");

  // Get the current plan details
  const currentPlan = subscription?.plan;

  // Calculate days remaining in current period
  const daysRemaining = subscription
    ? Math.ceil(
        (new Date(subscription.currentPeriodEnd).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return {
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
  };
}
