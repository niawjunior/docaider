import { type NextRequest } from "next/server";
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
        is_rag_enabled: true,
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
    }
  }

  return await updateSession(request);
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|$|login).*)",
  ],
};
