// hooks/useUserConfig.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserConfig {
  id: string;
  createdAt: string;
  updatedAt: string;
  languagePreference: "en" | "th" | null;
  themePreference: "system" | "light" | "dark" | null;
  notificationSettings:
    | {
        email?: boolean;
        push?: boolean;
      }
    | unknown;
  chatSettings:
    | {
        temperature?: number;
        max_tokens?: number;
      }
    | unknown;
  defaultCurrency: string | null;
  timezone: string | null;
}

export default function useUserConfig(userId: string) {
  const queryClient = useQueryClient();

  // Query for fetching user config
  const {
    data: config,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userConfig", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/user/config`);

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert from API snake_case to our camelCase format
      return {
        id: userId,
        languagePreference: data.language_preference,
        themePreference: data.theme_preference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notificationSettings: {},
        chatSettings: {},
        defaultCurrency: null,
        timezone: null,
      } as UserConfig;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for updating user config
  const { mutateAsync: updateConfig, isPending: isUpdating } = useMutation({
    mutationFn: async (updates: Partial<UserConfig>) => {
      // Convert from our camelCase to API snake_case format
      const apiPayload = {
        language_preference: updates.languagePreference,
        theme_preference: updates.themePreference,
      };

      const response = await fetch(`/api/user/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update config: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert from API snake_case to our camelCase format
      return {
        ...config,
        languagePreference: data.language_preference,
        themePreference: data.theme_preference,
        updatedAt: new Date().toISOString(),
      } as UserConfig;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userConfig", userId] });

      // Optionally update the cache directly
      if (data) {
        queryClient.setQueryData(["userConfig", userId], data);
      }
    },
    onError: (err) => {
      console.error("Error updating user config:", err);
    },
  });

  return {
    config,
    loading: isLoading,
    error,
    updateConfig,
    isUpdating,
  };
}
