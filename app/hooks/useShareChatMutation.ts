import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// The function that makes the API call to share a chat
const shareChatFn = async ({ chatId }: { chatId: string }) => {
  if (!chatId) {
    throw new Error("Chat ID is required to share the chat.");
  }

  const response = await fetch(`/api/share/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chatId }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    const message =
      responseData.error?.message || "Failed to create or update share link.";
    // Mimic Axios error structure or a consistent structure for client-side handling
    throw { response: { data: responseData }, message };
  }

  return responseData;
};

export const useShareChatMutation = (chatId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!chatId) {
        return Promise.reject(new Error("Chat ID is not available to share."));
      }
      return shareChatFn({ chatId });
    },
    onSuccess: (data: any, variables) => {
      // Added 'any' type for data for now
      queryClient.invalidateQueries({ queryKey: ["shareUrl", chatId] });
      // Use message from successful API response if available
      toast.success(data.message || "Share link created/updated successfully!");
    },
    onError: (error: any, variables, context) => {
      // Changed to error: any
      let errorMessage = "An unexpected error occurred.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.message
      ) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error("Share Failed", { description: errorMessage });
      console.error(
        "ShareChat Mutation failed:",
        error.response?.data?.error || error,
      );
    },
  });
};
