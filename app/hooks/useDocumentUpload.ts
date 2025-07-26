// hooks/useDocumentUpload.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * Custom hook for document upload operations
 * @returns Object with document upload operations and loading states
 */
export const useDocumentUpload = () => {
  const queryClient = useQueryClient();
  const messageT = useTranslations("messages");

  /**
   * Upload a document with the given file and title
   */
  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      title,
      isKnowledgeBase = false,
    }: {
      file: File;
      title: string;
      isKnowledgeBase?: boolean;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("isKnowledgeBase", isKnowledgeBase ? "true" : "false");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific error cases
        if (response.status === 409) {
          throw new Error(
            "A document with this title already exists. Please use a different title."
          );
        }

        throw new Error(errorData.error || "Failed to upload document");
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBaseDocuments"] });

      toast(messageT("documentUploaded"), {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast(messageT("documentUploadError"), {
        duration: 5000,
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload document. Please try again.",
      });
      console.error("Upload error:", error);
    },
  });

  return {
    uploadDocument,
    isUploading: uploadDocument.isPending,
  };
};
