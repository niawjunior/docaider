"use server";

import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithGoogle(callbackUrl?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/auth/callback?callback_url=${encodeURIComponent(
        callbackUrl || "/chat",
      )}`,
    },
  });

  if (error || !data?.url) {
    redirect("/error");
  }

  redirect(data.url); // this will redirect user to Google's login page
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Failed to sign out");
  }

  // Wait for a short delay to ensure the sign out is complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a Promise that resolves after the sign out is complete
  return new Promise((resolve) => {
    resolve();
  });
}

export async function getUserSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
