"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";
import { Session } from "@supabase/supabase-js";

const supabase = createClient();

export default function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(data.session);
      setLoading(false);
    };

    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
