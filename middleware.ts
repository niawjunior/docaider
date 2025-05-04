import { type NextRequest } from "next/server";
import { updateSession } from "./app/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log("middleware", request);
  return await updateSession(request);
}

export const config = {
  matcher: ["/chat/:path*", "/chat"],
};
