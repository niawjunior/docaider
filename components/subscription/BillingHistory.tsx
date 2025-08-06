"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";

interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripePaymentIntentId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: string;
  metadata: any;
  createdAt: string;
}

export function BillingHistory() {
  const supabase = useSupabaseSession();
  const user = supabase.session?.user;
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["billing-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch("/api/payments/history");
      if (!response.ok) {
        throw new Error("Failed to fetch payment history");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const handleDownloadInvoice = async (payment: Payment) => {
    if (!payment.stripeInvoiceId) {
      toast("No invoice available for this payment");
      return;
    }

    try {
      setIsDownloading(payment.id);
      const response = await fetch(
        `/api/payments/${payment.stripeInvoiceId}/invoice`
      );

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const data = await response.json();

      // Open invoice URL in a new tab
      window.open(data.invoiceUrl, "_blank");
    } catch (error: any) {
      toast(error.message || "Failed to download invoice");
    } finally {
      setIsDownloading(null);
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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            There was an error loading your billing history. Please try again
            later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          View your payment history and download invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments && payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment: Payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {format(new Date(payment.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {payment.metadata?.description || "Subscription Payment"}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment.currency?.toUpperCase() || "USD",
                    }).format(payment.amount / 100)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "succeeded"
                          ? "default"
                          : payment.status === "pending"
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(payment)}
                      disabled={
                        isDownloading === payment.id || !payment.stripeInvoiceId
                      }
                    >
                      {isDownloading === payment.id ? (
                        "Loading..."
                      ) : payment.stripeInvoiceId ? (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </>
                      ) : (
                        "N/A"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No payment history found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
