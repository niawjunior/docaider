// hooks/useDocuments.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Custom hook for document operations
 * @returns Object with document operations
 */
export const useDocuments = () => {
  const queryClient = useQueryClient();

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
      toast("Document deleted successfully", {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast("Error deleting document", {
        duration: 5000,
        description: "Failed to delete document. Please try again.",
      });
      console.error("Mutation error:", error);
    },
  });

  return {
    deleteDocument,
  };
};
