import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase/client";
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from("credits")
        .select()
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as Credit;
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateCredit = useMutation<number, Error, number>({
    mutationFn: async (newBalance: number) => {
      const supabase = createClient();
      const { error, data } = await supabase
        .from("credits")
        .update({ balance: newBalance })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data?.balance || newBalance;
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
