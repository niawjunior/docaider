"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "../utils/supabase/client";
import { Credit } from "../hooks/useUserCredit";

interface CreditContextType {
  credit: Credit | null;
  loading: boolean;
  error: string | null;
  updateCredit: (newBalance: number) => Promise<void>;
}

export const CreditContext = createContext<CreditContextType | undefined>(
  undefined
);

interface CreditProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function CreditProvider({ children, userId }: CreditProviderProps) {
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

      // Set up real-time subscription
      const supabase = createClient();
      const channel = supabase
        .channel("credit-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "credits",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchCredit();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
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
        throw err;
      }
    },
    [userId, fetchCredit]
  );

  return (
    <CreditContext.Provider
      value={{
        credit,
        loading,
        error,
        updateCredit,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredit() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredit must be used within a CreditProvider");
  }
  return context;
}
