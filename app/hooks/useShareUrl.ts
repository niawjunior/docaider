import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface ShareData {
  shareId: string;
  shareUrl: string;
  createdAt: string;
}

/**
 * Fetches share data for a chat from the API
 */
async function fetchShareData(chatId: string): Promise<ShareData | null> {
  if (!chatId) return null;

  const response = await fetch(`/api/share?chatId=${chatId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch share data");
  }

  const data = await response.json();
  return data || null;
}

/**
 * Hook for managing share URLs using TanStack Query
 */
export function useShareUrl(chatId: string) {
  const queryClient = useQueryClient();

  const {
    data: shareData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shareUrl", chatId],
    queryFn: () => fetchShareData(chatId),
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Refresh share data by invalidating the query
   */
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["shareUrl", chatId] });
  };

  return {
    shareData,
    isLoading,
    error: error as Error | null,
    refresh,
  };
}
