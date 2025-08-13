import { type NextRequest } from "next/server";
import { updateSession } from "./app/utils/supabase/middleware";
// import { createClient, createServiceClient } from "./app/utils/supabase/server";

export async function middleware(request: NextRequest) {
  // const supabase = await createClient();
  // const serviceSupabase = createServiceClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // // Check authorization for knowledge base routes
  // const pathname = request.nextUrl.pathname;
  // const kbEditMatch = pathname.match(/^\/knowledge\/([^/]+)\/edit$/);
  // const kbViewMatch = pathname.match(/^\/knowledge\/([^/]+)$/);

  // // Handle edit routes (requires ownership)
  // if (kbEditMatch) {
  //   const knowledgeBaseId = kbEditMatch[1];
  //   // Edit requires authentication
  //   if (!user) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/login";
  //     return Response.redirect(url);
  //   }

  //   // Check ownership
  //   const { data: knowledgeBase } = await serviceSupabase
  //     .from("knowledge_bases")
  //     .select("user_id")
  //     .eq("id", knowledgeBaseId)
  //     .single();

  //   if (!knowledgeBase || knowledgeBase.user_id !== user.id) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/dashboard";
  //     return Response.redirect(url);
  //   }
  // }

  // // Handle view routes (requires public access, ownership, or shared access)
  // if (kbViewMatch) {
  //   const knowledgeBaseId = kbViewMatch[1];

  //   // Check if knowledge base exists and get its visibility and ownership
  //   const { data: knowledgeBase } = await serviceSupabase
  //     .from("knowledge_bases")
  //     .select("user_id, is_public")
  //     .eq("id", knowledgeBaseId)
  //     .single();

  //   // If knowledge base doesn't exist, redirect to dashboard
  //   if (!knowledgeBase) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/dashboard";
  //     return Response.redirect(url);
  //   }

  //   // If knowledge base is not public
  //   if (!knowledgeBase.is_public) {
  //     // If user is not authenticated, redirect to login
  //     if (!user) {
  //       const url = request.nextUrl.clone();
  //       url.pathname = "/login";
  //       return Response.redirect(url);
  //     }

  //     // Check if user owns the knowledge base
  //     const isOwner = knowledgeBase.user_id === user.id;

  //     if (!isOwner) {
  //       // Check if knowledge base is shared with this user's email
  //       const { data: sharedAccess } = await serviceSupabase
  //         .from("knowledge_base_shares")
  //         .select("id")
  //         .eq("knowledge_base_id", knowledgeBaseId)
  //         .eq("shared_with_email", user.email)
  //         .single();

  //       // If user doesn't own it and it's not shared with them, redirect to dashboard
  //       if (!sharedAccess) {
  //         const url = request.nextUrl.clone();
  //         url.pathname = "/dashboard";
  //         return Response.redirect(url);
  //       }
  //     }
  //   }
  // }

  // Get the session response and return it
  return await updateSession(request);
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2|otf|eot|mp4)$|$|login).*)",
  ],
};
