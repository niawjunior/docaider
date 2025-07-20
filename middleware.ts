import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./app/utils/supabase/middleware";
import { createClient } from "./app/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();
    if (!existingUser) {
      // User doesn't exist, create a new user
      const { error: userError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email || "",
      });
      if (userError) {
        console.error("Error creating user:", userError);
      }
      // Initialize user config
      const { error: configError } = await supabase.from("user_config").insert({
        id: user.id,
        language_preference: "th",
        theme_preference: "dark",
        notification_settings: {
          email: true,
          push: true,
        },
        chat_settings: {
          temperature: 0.7,
          max_tokens: 2000,
        },
      });
      if (configError) {
        console.error("Error creating user config:", configError);
      }
      // Initialize user credits
      const { error: creditsError } = await supabase.from("credits").insert({
        user_id: user.id,
        balance: 50,
      });
      if (creditsError) {
        console.error("Error creating user credits:", creditsError);
      }
    }
  }

  // 🔒 ROUTE AUTHORIZATION CHECKS
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Check for Knowledge Base edit routes
  const kbEditMatch = pathname.match(/^\/knowledge\/([^/]+)\/edit$/);
  if (kbEditMatch) {
    const knowledgeBaseId = kbEditMatch[1];

    // If user is not authenticated, redirect to login
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Check if user owns this knowledge base
    const { data: knowledgeBase } = await supabase
      .from("knowledge_bases")
      .select("user_id")
      .eq("id", knowledgeBaseId)
      .single();

    // If KB doesn't exist or user doesn't own it, redirect to dashboard
    if (!knowledgeBase || knowledgeBase.user_id !== user.id) {
      console.warn(
        `Unauthorized access attempt to KB edit: ${knowledgeBaseId} by user: ${user.id}`
      );
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Check for other protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/knowledge", "/api/knowledge-base"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|$|login).*)",
  ],
};
