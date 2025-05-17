import { useState, useEffect, useCallback } from "react";
import { createClient } from "../utils/supabase/client";

export interface ShareData {
  shareId: string;
  shareUrl: string;
  createdAt: string;
}

export function useShareUrl(chatId: string): {
  shareData: ShareData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShareData = useCallback(async () => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("chat_shares")
        .select("share_id, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setShareData({
          shareId: data[0].share_id,
          shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${data[0].share_id}`,
          createdAt: data[0].created_at,
        });
      } else {
        setShareData(null);
      }
    } catch (err) {
      console.log("error", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch share data")
      );
      setShareData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      fetchShareData();
    }
  }, [chatId, fetchShareData]);

  return {
    shareData,
    isLoading,
    error,
    refresh: fetchShareData,
  };
}
