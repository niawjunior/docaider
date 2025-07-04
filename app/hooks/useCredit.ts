import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Credit } from "../hooks/useUserCredit";

export function useCredit(userId: string) {
  const queryClient = useQueryClient();

  const {
    data: credit,
    isLoading,
    error,
  } = useQuery<Credit | null>({
    queryKey: ["credit", userId],
    queryFn: async () => {
      try {
        // Call the API endpoint to get credit information
        const response = await fetch(`/api/credits`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // No credit found for this user
            return null;
          }
          throw new Error(`Error fetching credit: ${response.statusText}`);
        }
        
        // Return the credit data
        return await response.json();
      } catch (err) {
        console.error("Error fetching credit:", err);
        throw err;
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateCredit = useMutation<number, Error, number>({
    mutationFn: async (newBalance: number) => {
      try {
        // Call the API endpoint to update credit balance
        const response = await fetch(`/api/credits/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newBalance }),
        });
        
        if (!response.ok) {
          throw new Error(`Error updating credit: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.balance;
      } catch (err) {
        console.error("Error updating credit:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit", userId] });
    },
  });

  return {
    credit,
    isLoading,
    error,
    updateCredit: updateCredit.mutate,
  };
}
