// hooks/useDocuments.ts
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "../utils/supabase/client";
import { useTranslations } from "next-intl";

/**
 * Custom hook for document operations
 * @returns Object with document operations and loading states
 */
export const useDocuments = () => {
  const queryClient = useQueryClient();
  const messageT = useTranslations("messages");

  /**
   * Delete a document by its document ID
   */
  const deleteDocument = useMutation({
    mutationFn: async ({
      documentId,
      documentName,
    }: {
      documentId: string;
      documentName: string;
    }) => {
      try {
        // Call the API endpoint to delete the document
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete document");
        }

        return await response.json();
      } catch (error) {
        console.error("Error deleting document:", error);
        throw new Error(
          `Failed to delete document: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast(messageT("documentDeleted"), {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast(messageT("documentDeleteError"), {
        duration: 5000,
        description: "Failed to delete document. Please try again.",
      });
      console.error("Mutation error:", error);
    },
  });

  /**
   * Get documents with optional filters
   */
  const useGetDocuments = ({ isKnowledgeBase = false } = {}) => {
    return useQuery({
      queryKey: ["documents", { isKnowledgeBase }],
      queryFn: async () => {
        try {
          const supabase = await createClient();
          const { data: user } = await supabase.auth.getUser();

          if (!user?.user?.id) {
            throw new Error("User not authenticated");
          }

          const { data: documents, error } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", user.user.id)
            .eq("is_knowledge_base", isKnowledgeBase);

          if (error) {
            throw error;
          }

          return documents;
        } catch (error) {
          console.error("Error fetching documents:", error);
          throw new Error(
            `Failed to fetch documents: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      },
    });
  };

  return {
    deleteDocument,
    useGetDocuments,
  };
};
