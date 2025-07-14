// hooks/useKnowledgeBases.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
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
        return data.knowledgeBase;
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
        return data.documents || [];
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
      const { data, error } = await supabase
        .from("knowledge_bases")
        .select(
          `
          *,
          profiles:user_id (display_name)
        `
        )
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data.map((kb) => ({
        ...kb,
        user_name: kb.profiles?.display_name,
      })) as KnowledgeBase[];
    },
  });

  /**
   * Fetch public knowledge bases
   */
  const getPublicKnowledgeBases = useQuery({
    queryKey: ["knowledgeBases", { isPublic: true }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_bases")
        .select(
          `
          *,
          profiles:user_id (display_name)
        `
        )
        .eq("is_public", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data.map((kb) => ({
        ...kb,
        user_name: kb.profiles?.display_name,
      })) as KnowledgeBase[];
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
      toast("Knowledge base updated successfully", {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast("Error updating knowledge base", {
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
      toast("Knowledge base created successfully", {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast("Error creating knowledge base", {
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
      toast("Knowledge base deleted successfully", {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast("Error deleting knowledge base", {
        duration: 5000,
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete knowledge base. Please try again.",
      });
      console.error("Delete error:", error);
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
  };
};
