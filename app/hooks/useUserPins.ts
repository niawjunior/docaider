import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Interface for pinned knowledge base
interface PinnedKnowledgeBase {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;
  pinnedAt: string;
  isPinned: boolean;
}

// Hook to get user's pinned knowledge bases
export const useUserPins = () => {
  return useQuery({
    queryKey: ["userPins"],
    queryFn: async (): Promise<PinnedKnowledgeBase[]> => {
      const response = await fetch("/api/user-pins");
      if (!response.ok) {
        throw new Error("Failed to fetch pinned knowledge bases");
      }
      const data = await response.json();
      return data.pinnedKnowledgeBases || [];
    },
  });
};

// Hook to check if a specific knowledge base is pinned
export const useIsPinned = (knowledgeBaseId: string) => {
  const { data: pinnedKnowledgeBases = [] } = useUserPins();
  return pinnedKnowledgeBases.some(kb => kb.id === knowledgeBaseId);
};

// Hook to pin/unpin knowledge bases
export const useTogglePin = () => {
  const queryClient = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: async (knowledgeBaseId: string) => {
      const response = await fetch("/api/user-pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ knowledgeBaseId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to pin knowledge base");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPins"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["sharedKnowledgeBases"] });
      toast.success("Knowledge base pinned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to pin knowledge base");
    },
  });

  const unpinMutation = useMutation({
    mutationFn: async (knowledgeBaseId: string) => {
      const response = await fetch(`/api/user-pins/${knowledgeBaseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unpin knowledge base");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPins"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["sharedKnowledgeBases"] });
      toast.success("Knowledge base unpinned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unpin knowledge base");
    },
  });

  const togglePin = (knowledgeBaseId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinMutation.mutate(knowledgeBaseId);
    } else {
      pinMutation.mutate(knowledgeBaseId);
    }
  };

  return {
    togglePin,
    isPending: pinMutation.isPending || unpinMutation.isPending,
  };
};
