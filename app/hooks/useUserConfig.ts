// hooks/useUserConfig.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserConfig, updateUserConfig } from "../utils/db-actions";

export interface UserConfig {
  id: string;
  createdAt: string;
  updatedAt: string;
  languagePreference: string | null;
  themePreference: string | null;
  notificationSettings: {
    email?: boolean;
    push?: boolean;
  } | unknown;
  chatSettings: {
    temperature?: number;
    max_tokens?: number;
  } | unknown;
  defaultCurrency: string | null;
  timezone: string | null;
}

export default function useUserConfig(userId: string) {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getConfig = useCallback(async () => {
    try {
      // Use server action instead of API route
      const data = await getUserConfig(userId);
      if (data) {
        setConfig(data);
      }
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
      // Use server action instead of API route
      const updatedConfig = await updateUserConfig(userId, updates);
      
      // Update state with the returned config
      if (updatedConfig) {
        setConfig(updatedConfig);
      } else {
        // Optimistically update state if no config returned
        setConfig((prev) => (prev ? { ...prev, ...updates } : null));
      }
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
