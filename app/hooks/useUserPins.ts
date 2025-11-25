import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// Interface for pinned knowledge base
interface PinnedKnowledgeBase {
  id: string;
  name: string;
  detail?: string;
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
  const messageT = useTranslations("messages");
  return useQuery({
    queryKey: ["userPins"],
    queryFn: async (): Promise<PinnedKnowledgeBase[]> => {
      const response = await fetch("/api/user-pins");
      if (!response.ok) {
        throw new Error(messageT("knowledgeBasePinError"));
      }
      const data = await response.json();
      return data.pinnedKnowledgeBases || [];
    },
  });
};

// Hook to check if a specific knowledge base is pinned
export const useIsPinned = (knowledgeBaseId: string) => {
  const { data: pinnedKnowledgeBases = [] } = useUserPins();
  return pinnedKnowledgeBases.some((kb) => kb.id === knowledgeBaseId);
};

// Hook to pin/unpin knowledge bases
export const useTogglePin = () => {
  const queryClient = useQueryClient();
  const messageT = useTranslations("messages");

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
        throw new Error(messageT("knowledgeBasePinError"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPins"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["sharedKnowledgeBases"] });
      toast.success(messageT("knowledgeBasePinned"));
    },
    onError: () => {
      toast.error(messageT("knowledgeBasePinError"));
    },
  });

  const unpinMutation = useMutation({
    mutationFn: async (knowledgeBaseId: string) => {
      const response = await fetch(`/api/user-pins/${knowledgeBaseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(messageT("knowledgeBaseUnpinError"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPins"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["sharedKnowledgeBases"] });
      toast.success(messageT("knowledgeBaseUnpinned"));
    },
    onError: () => {
      toast.error(messageT("knowledgeBaseUnpinError"));
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
