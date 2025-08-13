import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/config";
import { userConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createServiceClient } from "@/app/utils/supabase/server";

/**
 * GET /api/user/config/[id]
 * Retrieves a user's configuration settings by ID
 * This endpoint is designed to be called from middleware
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use service client to verify the request is legitimate
    const supabase = createServiceClient();

    // Verify user exists
    const { data: user, error } = await supabase.auth.admin.getUserById(id);

    if (error || !user.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user config using Drizzle ORM
    const userConfigData = await db
      .select({
        languagePreference: userConfig.languagePreference,
        themePreference: userConfig.themePreference,
        useDocument: userConfig.useDocument,
      })
      .from(userConfig)
      .where(eq(userConfig.id, id))
      .limit(1);

    // Return default values if no config exists
    if (!userConfigData || userConfigData.length === 0) {
      return NextResponse.json({
        languagePreference: "en",
        themePreference: "system",
        useDocument: false,
      });
    }

    // Return the config
    return NextResponse.json(userConfigData[0]);
  } catch (error) {
    console.error("Error fetching user config:", error);
    return NextResponse.json(
      { error: "Failed to fetch user config" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
