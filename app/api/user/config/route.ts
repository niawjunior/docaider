import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/db/config";
import { userConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define TypeScript interface for user config
interface UserConfigData {
  language_preference: string;
  theme_preference: string;
}

/**
 * GET /api/user/config
 * Retrieves the current user's configuration settings
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user config using Drizzle ORM
    const userConfigData = await db
      .select({
        languagePreference: userConfig.languagePreference,
        themePreference: userConfig.themePreference,
      })
      .from(userConfig)
      .where(eq(userConfig.id, user.id))
      .limit(1);

    // Return default values if no config exists
    if (!userConfigData || userConfigData.length === 0) {
      return NextResponse.json({
        language_preference: "en",
        theme_preference: "dark",
      });
    }

    // Transform from camelCase (DB schema) to snake_case (API response)
    return NextResponse.json({
      language_preference: userConfigData[0].languagePreference,
      theme_preference: userConfigData[0].themePreference,
    });
  } catch (error) {
    console.error("Error in GET /api/user/config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/config
 * Updates the current user's configuration settings
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Validate request body
    let body: UserConfigData;
    try {
      body = await request.json();
      
      // Validate required fields
      if (!body.language_preference || !body.theme_preference) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user config exists
    const existingConfig = await db
      .select({ id: userConfig.id })
      .from(userConfig)
      .where(eq(userConfig.id, user.id))
      .limit(1);

    let result;
    
    if (existingConfig && existingConfig.length > 0) {
      // Update existing config
      result = await db
        .update(userConfig)
        .set({
          languagePreference: body.language_preference,
          themePreference: body.theme_preference,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userConfig.id, user.id))
        .returning({
          languagePreference: userConfig.languagePreference,
          themePreference: userConfig.themePreference,
        });
    } else {
      // Insert new config
      result = await db
        .insert(userConfig)
        .values({
          id: user.id,
          languagePreference: body.language_preference,
          themePreference: body.theme_preference,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning({
          languagePreference: userConfig.languagePreference,
          themePreference: userConfig.themePreference,
        });
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Failed to save user config" },
        { status: 500 }
      );
    }

    // Transform from camelCase (DB schema) to snake_case (API response)
    return NextResponse.json({
      language_preference: result[0].languagePreference,
      theme_preference: result[0].themePreference,
    });
  } catch (error) {
    console.error("Error in POST /api/user/config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
