import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client"; // Adjusted path
import { toast } from "sonner";

// Define the UserConfig interface
// Ensure this matches your actual user_config table structure in Supabase
export interface UserConfig {
  id?: string; // Assuming 'id' is the primary key and is user_id
  user_id?: string; // Explicit user_id if 'id' is not user_id
  generate_bar_chart_enabled?: boolean;
  generate_pie_chart_enabled?: boolean;
  get_crypto_price_enabled?: boolean;
  get_crypto_market_summary_enabled?: boolean;
  ask_question_enabled?: boolean;
  // Add any other config fields here
  created_at?: string;
  updated_at?: string;
}

// Function to fetch user configuration
const fetchUserConfig = async (userId: string): Promise<UserConfig | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_config") // Corrected table name to 'user_config'
    .select("*")
    .eq("user_id", userId) // Assuming 'user_id' is the column to filter by
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Standard Supabase code for "No rows found"
      console.warn(
        `No user configuration found for user_id: ${userId}. A default one might be created or used.`,
      );
      return null;
    }
    // For other errors, throw to be caught by useQuery's error handling
    console.error("Error fetching user config:", error);
    throw new Error(error.message || "Failed to fetch user configuration.");
  }
  return data as UserConfig;
};

// Function to update user configuration (remains largely the same, but errors will be handled by mutation's onError)
const updateUserConfigFn = async ({
  userId,
  updates,
}: {
  userId: string;
  updates: Partial<UserConfig>;
}): Promise<UserConfig | null> => {
  const supabase = createClient();
  const { user_id, id, ...updateData } = updates;

  // This function now directly calls Supabase. If it's intended to call a standardized API endpoint,
  // it should be changed to fetch('/api/user-config', ...) for example.
  // For now, assuming direct Supabase client use is acceptable here.
  const { data, error } = await supabase
    .from("user_config")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.details?.includes("0 rows")) {
      const { data: insertData, error: insertError } = await supabase
        .from("user_config")
        .insert({ ...updateData, user_id: userId })
        .select()
        .single();
      if (insertError) {
        throw new Error(
          insertError.message || "Failed to create user configuration.",
        );
      }
      return insertData as UserConfig;
    }
    throw new Error(error.message || "Failed to update user configuration.");
  }
  return data as UserConfig;
};

// The refactored hook
export const useUserConfig = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    error: queryError,
  } = useQuery<UserConfig | null, Error>({
    queryKey: ["userConfig", userId],
    queryFn: () => {
      if (!userId) {
        return Promise.resolve(null);
      }
      return fetchUserConfig(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    // onError for query can be handled here or at component level if needed
    // For example, by displaying a general "could not load settings" message.
  });

  const mutation = useMutation<UserConfig | null, Error, Partial<UserConfig>>({
    mutationFn: (updates: Partial<UserConfig>) => {
      if (!userId) {
        return Promise.reject(
          new Error("User ID is not available for config update."),
        );
      }
      // Assuming updateUserConfigFn makes a direct Supabase call or hits an API endpoint.
      // If it hits an API endpoint that returns standardized errors, the 'error: any' type below
      // will receive an object that might have error.response.data.error.message.
      return updateUserConfigFn({ userId, updates });
    },
    onSuccess: (updatedConfigData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userConfig", userId] });
      // More robust optimistic update:
      queryClient.setQueryData(
        ["userConfig", userId],
        (old: UserConfig | null | undefined) =>
          updatedConfigData ? { ...old, ...updatedConfigData } : old,
      );

      toast.success("Configuration updated successfully!");
    },
    onError: (error: any, variables, context) => {
      // Changed 'err: Error' to 'error: any'
      let errorMessage =
        "An unexpected error occurred while updating configuration.";
      // Check if the error comes from a standardized API response
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.message
      ) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        // Fallback to generic error message
        errorMessage = error.message;
      }
      toast.error("Update Failed", { description: errorMessage });
      console.error(
        "UserConfig Mutation failed:",
        error.response?.data?.error || error,
      );
    },
  });

  return {
    config: config,
    isLoading: isLoading,
    error: queryError, // Expose query error
    updateConfig: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

export default useUserConfig;
