import { NextResponse } from "next/server";
import { userConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/config";

/**
 * Applies user configuration settings to cookies in middleware
 * This allows theme and language preferences to be applied before the UI renders
 */
export async function applyUserConfig(
  response: NextResponse,
  userId: string | undefined
): Promise<NextResponse> {
  // If no user is logged in, don't try to fetch config
  if (!userId) {
    return response;
  }

  try {
    // Get user config using Drizzle ORM
    const userConfigData = await db
      .select({
        languagePreference: userConfig.languagePreference,
        themePreference: userConfig.themePreference,
      })
      .from(userConfig)
      .where(eq(userConfig.id, userId))
      .limit(1);

    // If no config exists, use defaults
    const theme = userConfigData?.[0]?.themePreference || "system";
    const language = userConfigData?.[0]?.languagePreference || "en";

    // Set cookies for theme and language
    // These will be read by the client to apply settings immediately
    response.cookies.set("theme", theme, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    response.cookies.set("locale", language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error applying user config in middleware:", error);
    // Return the original response if there's an error
    return response;
  }
}
