"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

export interface Credit {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function useUserCredit(userId: string) {
  const [credit, setCredit] = useState<Credit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredit = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("credits")
        .select()
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setCredit(data as Credit);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching credit:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCredit();
    }
  }, [userId, fetchCredit]);

  const updateCredit = useCallback(
    async (newBalance: number) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("credits")
          .update({ balance: newBalance })
          .eq("user_id", userId);

        if (error) throw error;
        await fetchCredit();
      } catch (err: any) {
        setError(err.message);
        console.error("Error updating credit:", err);
      }
    },
    [userId, fetchCredit]
  );

  return {
    credit,
    loading,
    error,
    updateCredit,
  };
}
