import { type NextRequest } from "next/server";
import { updateSession } from "./app/utils/supabase/middleware";

// Middleware now only handles session management
// Permission checks have been moved to individual page components
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2|otf|eot|mp4)$|$|login).*)",
  ],
};
