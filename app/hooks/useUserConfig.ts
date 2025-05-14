// hooks/useUserConfig.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

export interface UserConfig {
  id: string;
  user_id: string;
  is_rag_enabled: boolean;
  language_preference: string;
  theme_preference: string;
  notification_settings: {
    email: boolean;
    push: boolean;
  };
  chat_settings: {
    temperature: number;
    max_tokens: number;
  };
  default_currency: string;
  timezone: string;
}

export default function useUserConfig(userId: string) {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  console.log("userId", userId);
  const getConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_config")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (err) {
      console.error("Error fetching user config:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch config")
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateConfig = async (updates: Partial<UserConfig>) => {
    try {
      const { error } = await supabase
        .from("user_config")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      // Optimistically update state
      setConfig((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error("Error updating user config:", err);
      throw err instanceof Error ? err : new Error("Failed to update config");
    }
  };

  useEffect(() => {
    if (!userId) return;
    getConfig();
  }, [userId, getConfig]);

  return {
    config,
    loading,
    error,
    updateConfig,
  };
}
