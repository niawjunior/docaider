"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionDetails } from "@/components/subscription/SubscriptionDetails";
import { BillingHistory } from "@/components/subscription/BillingHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import MainLayout from "../components/MainLayout";

export default function BillingPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login?redirectedFrom=/billing");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="container max-w-5xl py-8">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="px-6">
        <h1 className="md:text-lg text-md font-bold">Billing & Subscription</h1>

        <Tabs defaultValue="subscription" className="w-full pt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-4">
            <SubscriptionDetails />
          </TabsContent>

          <TabsContent value="history">
            <BillingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
