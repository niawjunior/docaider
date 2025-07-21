import { type NextRequest } from "next/server";
import { updateSession } from "./app/utils/supabase/middleware";
import { createClient } from "./app/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only check authorization for edit routes
  const pathname = request.nextUrl.pathname;
  const kbEditMatch = pathname.match(/^\/knowledge\/([^/]+)\/edit$/);

  if (kbEditMatch) {
    const knowledgeBaseId = kbEditMatch[1];

    // Edit requires authentication
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return Response.redirect(url);
    }

    // Check ownership
    const { data: knowledgeBase } = await supabase
      .from("knowledge_bases")
      .select("user_id")
      .eq("id", knowledgeBaseId)
      .single();

    if (!knowledgeBase || knowledgeBase.user_id !== user.id) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return Response.redirect(url);
    }
  }

  return await updateSession(request);
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2|otf|eot|mp4)$|$|login).*)",
  ],
};
