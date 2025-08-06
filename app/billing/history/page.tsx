"use client";

import { BillingHistory } from "@/components/subscription/BillingHistory";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";

export default function BillingHistoryPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login?redirectedFrom=/billing/history");
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
    <div className="container max-w-5xl py-8">
      <div className="flex items-center mb-6">
        <Link href="/billing">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Billing History</h1>
      </div>

      <BillingHistory />
    </div>
  );
}
