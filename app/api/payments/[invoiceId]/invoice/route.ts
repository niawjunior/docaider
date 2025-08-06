import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/config";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/app/utils/supabase/server";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    const { invoiceId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that this invoice belongs to the user
    const userPayment = await db.query.payments.findFirst({
      where: eq(payments.stripe_invoice_id, invoiceId),
    });

    if (!userPayment || userPayment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Invoice not found or access denied" },
        { status: 404 }
      );
    }

    // Get the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found in Stripe" },
        { status: 404 }
      );
    }

    // Return the invoice URL for the client to open
    return NextResponse.json({
      invoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    });
  } catch (error: any) {
    console.error("Error retrieving invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve invoice" },
      { status: 500 }
    );
  }
}
