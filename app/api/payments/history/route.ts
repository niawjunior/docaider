import { NextResponse } from "next/server";
import { db } from "@/db/config";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/app/utils/supabase/server";

export async function GET() {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's payment history
    const paymentHistory = await db.query.payments.findMany({
      where: eq(payments.user_id, session.user.id),
      orderBy: (payments, { desc }) => [desc(payments.created_at)],
    });

    return NextResponse.json(paymentHistory);
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
