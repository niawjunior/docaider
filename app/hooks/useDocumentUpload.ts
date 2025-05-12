import { useState, useCallback } from "react";

export type DocumentUploadResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export interface DocumentUploadConfig {
  chatId?: string;
  apiEndpoint: string;
}

export function useDocumentUpload(config: DocumentUploadConfig) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = useCallback(
    async (file: File, title: string): Promise<DocumentUploadResult> => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);

        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `uploadDocument: ${title}`,
                tool_calls: [
                  {
                    id: "uploadDocument",
                    type: "function",
                    function: {
                      name: "uploadDocument",
                      arguments: JSON.stringify({
                        file: file,
                        title: title,
                      }),
                    },
                  },
                ],
              },
            ],
            chatId: config.chatId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to upload document");
        }

        return {
          success: true,
          message: `Document "${title}" uploaded successfully`,
        };
      } catch (error) {
        console.error("Error uploading document:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setIsUploading(false);
      }
    },
    [config.apiEndpoint, config.chatId]
  );

  return {
    isUploading,
    uploadDocument,
  };
}
