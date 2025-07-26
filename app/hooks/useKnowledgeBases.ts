// hooks/useKnowledgeBases.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// This interface is used for type checking in the API responses
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  is_pinned: boolean;
  document_ids: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name?: string;
}

/**
 * Custom hook for knowledge base operations
 */
export const useKnowledgeBases = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const messageT = useTranslations("messages");

  /**
   * Fetch a single knowledge base by ID
   */
  const useKnowledgeBaseById = (id: string) => {
    return useQuery({
      queryKey: ["knowledgeBase", id],
      queryFn: async () => {
        const response = await fetch(`/api/knowledge-base/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Knowledge base not found");
          }

          if (response.status === 401) {
            throw new Error("Unauthorized");
          }

          throw new Error("Failed to fetch knowledge base");
        }

        const data = await response.json();
        return data;
      },
      enabled: !!id,
    });
  };

  /**
   * Fetch documents for a knowledge base
   */
  const useKnowledgeBaseDocuments = (id: string) => {
    return useQuery({
      queryKey: ["knowledgeBaseDocuments", id],
      queryFn: async () => {
        const response = await fetch(`/api/knowledge-base/${id}/documents`);
        if (!response.ok) {
          throw new Error("Failed to fetch knowledge base documents");
        }

        const data = await response.json();
        return data || [];
      },
      enabled: !!id,
    });
  };

  /**
   * Fetch knowledge bases based on filters
   */
  const getKnowledgeBases = useQuery({
    queryKey: ["knowledgeBases", { isPublic: false }],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/knowledge-base`);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized");
          }
          throw new Error("Failed to fetch knowledge bases");
        }

        const data = await response.json();
        return data.knowledgeBases || [];
      } catch (error) {
        console.error("Error fetching knowledge bases:", error);
        throw error;
      }
    },
  });

  /**
   * Fetch public knowledge bases
   */
  const getPublicKnowledgeBases = useQuery({
    queryKey: ["knowledgeBases", { isPublic: true }],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/knowledge-base?isPublic=true`);

        if (!response.ok) {
          throw new Error("Failed to fetch public knowledge bases");
        }

        const data = await response.json();
        return data.knowledgeBases || [];
      } catch (error) {
        console.log("error", error);
        console.error("Error fetching public knowledge bases:", error);
        throw error;
      }
    },
  });

  /**
   * Update an existing knowledge base
   */
  const updateKnowledgeBase = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      isPublic,
    }: {
      id: string;
      name: string;
      description: string;
      isPublic: boolean;
    }) => {
      try {
        const response = await fetch(`/api/knowledge-base/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            isPublic,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update knowledge base");
        }

        return await response.json();
      } catch (error) {
        console.error("Error updating knowledge base:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
      toast(messageT("knowledgeBaseUpdated"), {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast(messageT("knowledgeBaseUpdateError"), {
        duration: 5000,
        description:
          error instanceof Error
            ? error.message
            : "Failed to update knowledge base. Please try again.",
      });
      console.error("Update error:", error);
    },
  });

  /**
   * Create a new knowledge base
   */
  const createKnowledgeBase = useMutation({
    mutationFn: async ({
      name,
      description,
      isPublic,
      userId,
    }: {
      name: string;
      description: string;
      isPublic: boolean;
      userId: string;
    }) => {
      try {
        // Create the knowledge base
        const { data, error } = await supabase
          .from("knowledge_bases")
          .insert({
            name: name.trim(),
            description: description.trim(),
            is_public: isPublic,
            user_id: userId,
          })
          .select("id")
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating knowledge base:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      toast(messageT("knowledgeBaseCreated"), {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast(messageT("knowledgeBaseCreateError"), {
        duration: 5000,
        description:
          error instanceof Error
            ? error.message
            : "Failed to create knowledge base. Please try again.",
      });
      console.error("Create error:", error);
    },
  });

  /**
   * Delete a knowledge base
   */
  const deleteKnowledgeBase = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Use the API endpoint for deletion which handles cascade deletion
        const response = await fetch(`/api/knowledge-base/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete knowledge base");
        }

        return id;
      } catch (error) {
        console.error("Error in deleteKnowledgeBase:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["publicKnowledgeBases"] });
      toast(messageT("knowledgeBaseDeletedSuccess"), {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast(messageT("knowledgeBaseDeleteError"), {
        duration: 5000,
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete knowledge base. Please try again.",
      });
      console.error("Delete error:", error);
    },
  });

  /**
   * Update the knowledge base's document IDs
   * @param documentIds The updated array of document IDs
   * @returns Promise that resolves when the update is complete
   */

  const patchKnowledgeBaseDocumentIds = useMutation({
    mutationFn: async ({
      knowledgeBaseId,
      documentIds,
    }: {
      knowledgeBaseId: string;
      documentIds: string[];
    }) => {
      try {
        const response = await fetch(`/api/knowledge-base/${knowledgeBaseId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to update knowledge base document IDs");
        }

        return response.json();
      } catch (error) {
        console.error("Error updating knowledge base document IDs:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["publicKnowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBaseDocuments"] });
    },
    onError: (error) => {
      toast("Error updating knowledge base document IDs", {
        duration: 5000,
        description:
          error instanceof Error
            ? error.message
            : "Failed to update knowledge base document IDs. Please try again.",
      });
      console.error("Patch error:", error);
    },
  });

  return {
    getKnowledgeBases,
    getPublicKnowledgeBases,
    deleteKnowledgeBase,
    createKnowledgeBase,
    updateKnowledgeBase,
    useKnowledgeBaseById,
    useKnowledgeBaseDocuments,
    patchKnowledgeBaseDocumentIds,
  };
};
