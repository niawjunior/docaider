import { useQuery } from "@tanstack/react-query";

export interface SharedKnowledgeBase {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  sharedByEmail: string;
  sharedAt: string;
}

interface SharedKnowledgeBasesResponse {
  sharedKnowledgeBases: SharedKnowledgeBase[];
}

export const useSharedKnowledgeBases = (userEmail: string) => {
  return useQuery({
    queryKey: ["shared-knowledge-bases", userEmail],
    queryFn: async (): Promise<SharedKnowledgeBasesResponse> => {
      const response = await fetch(`/api/knowledge-bases/shared?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch shared knowledge bases");
      }
      return response.json();
    },
    enabled: !!userEmail,
  });
};
