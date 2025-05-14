// hooks/useSupabaseSession.ts
"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";

interface User {
  id: string;
  email: string;
  name?: string;
  // Add other fields from your users table as needed
}

const supabase = createClient();

export default function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getSession = async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      setSession(data.session);

      // If there's a session, fetch user data
      if (data.session?.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (userError) throw userError;
        setUser(userData);
      }
    } catch (err) {
      console.error("Error fetching session/user data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch session")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      // Update session immediately
      setSession(newSession);
      setUser(null);
      setLoading(true);
      setError(null);

      // Then fetch full data
      await getSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    error,
  };
}
