import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const callbackUrl = searchParams.get("callback_url") || "/";

  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Initialize user after successful authentication
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Create a service role client to bypass RLS for user initialization
          const serviceSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // Check if user already exists
          const { data: existingUser } = await serviceSupabase
            .from("users")
            .select("id")
            .eq("id", authUser.id)
            .single();

          // Create user record only if it doesn't exist
          if (!existingUser) {
            const { error: userError } = await serviceSupabase
              .from("users")
              .insert({
                id: authUser.id,
                email: authUser.email,
                display_name: authUser.user_metadata?.full_name || authUser.email || "",
              });

            if (userError) {
              console.error("Error creating user:", userError);
            } else {
              console.log("User created successfully");
            }
          }

          // Check if user config exists
          const { data: existingConfig } = await serviceSupabase
            .from("user_config")
            .select("id")
            .eq("id", authUser.id)
            .single();

          // Create user config only if it doesn't exist
          if (!existingConfig) {
            const { error: configError } = await serviceSupabase
              .from("user_config")
              .insert({
                id: authUser.id,
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
            } else {
              console.log("User config created successfully");
            }
          } else {
            console.log("User config already exists");
          }
        }
      } catch (initError) {
        console.error("Error during user initialization:", initError);
        // Don't block the redirect if initialization fails
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${callbackUrl}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${callbackUrl}`);
      } else {
        return NextResponse.redirect(`${origin}${callbackUrl}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
