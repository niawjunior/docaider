"use server";

import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, // or your actual callback URL
    },
  });

  if (error || !data?.url) {
    redirect("/error");
  }

  redirect(data.url); // this will redirect user to Google's login page
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  redirect("/");
}

export async function getUserSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
