import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface KnowledgeBaseShare {
  id: string;
  sharedWithEmail: string;
  createdAt: string;
}

interface SharesResponse {
  shares: KnowledgeBaseShare[];
}

interface ShareResponse {
  share: KnowledgeBaseShare;
}

export const useKnowledgeBaseShares = (knowledgeBaseId: string) => {
  const queryClient = useQueryClient();

  // Fetch shares for a knowledge base
  const {
    data: sharesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["knowledge-base-shares", knowledgeBaseId],
    queryFn: async (): Promise<SharesResponse> => {
      const response = await fetch(
        `/api/knowledge-bases/${knowledgeBaseId}/shares`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch shares");
      }
      return response.json();
    },
    enabled: !!knowledgeBaseId,
  });

  // Add a new share
  const addShareMutation = useMutation({
    mutationFn: async (email: string): Promise<ShareResponse> => {
      const response = await fetch(
        `/api/knowledge-bases/${knowledgeBaseId}/shares`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add share");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base-shares", knowledgeBaseId],
      });
      toast.success("User added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove a share
  const removeShareMutation = useMutation({
    mutationFn: async (shareId: string): Promise<void> => {
      const response = await fetch(
        `/api/knowledge-bases/${knowledgeBaseId}/shares?shareId=${shareId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove share");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base-shares", knowledgeBaseId],
      });
      toast.success("User removed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    shares: sharesData?.shares || [],
    isLoading,
    error,
    addShare: addShareMutation.mutate,
    removeShare: removeShareMutation.mutate,
    isAddingShare: addShareMutation.isPending,
    isRemovingShare: removeShareMutation.isPending,
  };
};
