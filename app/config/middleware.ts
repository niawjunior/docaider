import { NextResponse } from "next/server";

/**
 * Applies user configuration settings to cookies in middleware
 * This version uses a fetch request to an API endpoint instead of direct database access
 * which is compatible with Edge Runtime
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
    // Create API URL with the current host
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/user/config/${userId}`;
    
    // Fetch user config from API
    const configResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!configResponse.ok) {
      throw new Error(`Failed to fetch user config: ${configResponse.status}`);
    }

    const userConfigData = await configResponse.json();
    
    // If no config exists, use defaults
    const theme = userConfigData?.themePreference || "system";
    const language = userConfigData?.languagePreference || "en";

    // Set cookies for theme and language
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
