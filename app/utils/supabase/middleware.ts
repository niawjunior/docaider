import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api/knowledge-base") &&
    !request.nextUrl.pathname.startsWith("/terms") &&
    !request.nextUrl.pathname.startsWith("/privacy") &&
    !request.nextUrl.pathname.startsWith("/contact") &&
    !request.nextUrl.pathname.startsWith("/pricing") &&
    !request.nextUrl.pathname.startsWith("/sitemap") &&
    !request.nextUrl.pathname.startsWith("/robots.txt") &&
    !request.nextUrl.pathname.startsWith("/api/user/config") &&
    !request.nextUrl.pathname.startsWith("/api/support") &&
    !request.nextUrl.pathname.startsWith("/embed.js") &&
    !request.nextUrl.pathname.startsWith("/embed.css") &&
    !request.nextUrl.pathname.startsWith("/api/chat") &&
    !request.nextUrl.pathname.startsWith("/api/suggestions") &&
    !request.nextUrl.pathname.startsWith("/api/improve-writing") &&
    !request.nextUrl.pathname.startsWith("/api/embed/initialize") &&
    !request.nextUrl.pathname.startsWith("/demo.html") &&
    !request.nextUrl.pathname.startsWith("/api/credits") &&
    !request.nextUrl.pathname.startsWith("/api/line/webhook") &&
    !request.nextUrl.pathname.startsWith("/api/transcribe") &&
    !request.nextUrl.pathname.startsWith("/api/text-to-speech") &&
    !request.nextUrl.pathname.startsWith("/p/") && // Public resumes
    // Allow resume builder landing page and gallery, but protect create/edit routes
    !(
      request.nextUrl.pathname === "/resume-builder" || 
      request.nextUrl.pathname.startsWith("/resume-builder/gallery")
    )
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    const callbackUrl = url.pathname;
    url.pathname = "/login";
    url.searchParams.set("callback_url", callbackUrl);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
