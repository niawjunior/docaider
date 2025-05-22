import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client"; // Adjusted path
import { toast } from "sonner";

// Assuming DocumentType is defined elsewhere, e.g., in useFetchDocuments.ts or a global types file
// For now, let's define it here for clarity if not.
interface DocumentType {
  title: string;
  created_at: string;
  url: string;
  id: string; // Typically the primary key of the 'documents' table row (or chunk)
  active: boolean;
  document_id: string; // The ID that groups all chunks of the same document
  document_name: string; // The actual file name in storage
  user_id?: string; // User ID, ensure it's available if needed for Supabase policies
}

// Function to upload a document
// Corresponds to handleDocumentUpload in ChatForm.tsx
const uploadDocumentFn = async ({
  file,
  title,
  userId,
}: {
  file: File;
  title: string;
  userId: string;
}) => {
  if (!userId) throw new Error("User ID is required for upload.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  // If your API requires userId in the formData, append it here.
  // formData.append('userId', userId);

  // The original logic posted to '/api/pdf'. We'll assume this API endpoint handles Supabase uploads internally.
  // If direct Supabase upload is preferred here, that logic would be different.
  const response = await fetch("/api/pdf", {
    // Ensure this API endpoint is correctly set up
    method: "POST",
    body: formData,
    // Include headers if required by your API, e.g., for auth if not cookie-based
  });

  const responseData = await response.json();
  if (!response.ok) {
    // Use the error structure from createErrorResponse if available
    const message = responseData.error?.message || "Failed to upload document.";
    throw { response: { data: responseData }, message }; // Mimic Axios error structure for consistency
  }
  return responseData; // Assuming the API returns some data, e.g., the new document record
};

// Function to delete a document
// Corresponds to handleDeleteDocument in ChatForm.tsx
const deleteDocumentFn = async ({
  document_id,
  document_name,
  userId,
}: {
  document_id: string;
  document_name: string;
  userId: string;
}) => {
  if (!userId) throw new Error("User ID is required for deletion.");

  const supabase = createClient();

  // 1. Delete the file from Supabase storage
  const { error: storageError } = await supabase.storage
    .from("documents") // Bucket name
    .remove([`user_${userId}/${document_name}`]); // Path in storage

  if (storageError) {
    // It's possible the file doesn't exist in storage but db entries do,
    // or permissions error. Decide if this should halt the process.
    // For now, we log and continue to attempt db deletion.
    console.warn(
      "Storage deletion error (might be benign if file was already removed):",
      storageError.message,
    );
    // throw new Error(`Storage deletion failed: ${storageError.message}`);
  }

  // 2. Delete all database entries (chunks) with the same document_id
  const { error: dbError } = await supabase
    .from("documents") // Table name
    .delete()
    .eq("document_id", document_id)
    .eq("user_id", userId); // Ensure user can only delete their own documents

  if (dbError) {
    // This error will be caught by useMutation's onError
    throw new Error(`Database deletion failed: ${dbError.message}`);
  }

  return { document_id }; // Return identifier of deleted document
};

// Function to toggle document active state
// Corresponds to handleToggleDocumentActive in ChatForm.tsx
const toggleDocumentActiveFn = async ({
  document_id,
  currentActiveState,
  userId,
}: {
  document_id: string;
  currentActiveState: boolean;
  userId: string;
}) => {
  if (!userId) throw new Error("User ID is required for toggling state.");

  const supabase = createClient();
  const newActiveState = !currentActiveState;

  const { error } = await supabase
    .from("documents") // Table name
    .update({ active: newActiveState })
    .eq("document_id", document_id) // Apply to all chunks of the document
    .eq("user_id", userId); // Ensure user can only toggle their own documents

  if (error) {
    throw new Error(`Failed to toggle document status: ${error.message}`);
  }

  return { document_id, newActiveState }; // Return identifier and new state
};

export const useDocumentMutations = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const commonOnError = (error: any, contextMessage: string) => {
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
    toast.error(`${contextMessage}: ${errorMessage}`);
    console.error(
      "Mutation failed:",
      contextMessage,
      error.response?.data?.error || error,
    );
  };

  const uploadDocumentMutation = useMutation({
    mutationFn: (variables: { file: File; title: string }) => {
      if (!userId)
        return Promise.reject(
          new Error("User ID is not available for upload."),
        );
      return uploadDocumentFn({ ...variables, userId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      queryClient.invalidateQueries({ queryKey: ["credit", userId] });
      toast.success(
        data.message || `Document "${variables.title}" uploaded successfully!`,
      );
    },
    onError: (error: any, variables) => {
      commonOnError(error, `Upload failed for "${variables.title}"`);
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (variables: {
      document_id: string;
      document_name: string;
      title?: string;
    }) => {
      if (!userId)
        return Promise.reject(
          new Error("User ID is not available for deletion."),
        );
      return deleteDocumentFn({ ...variables, userId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      toast.success(
        `Document "${variables.title || variables.document_name}" deleted successfully.`,
      );
    },
    onError: (error: any, variables) => {
      commonOnError(
        error,
        `Could not delete document "${variables.title || variables.document_name}"`,
      );
    },
  });

  const toggleDocumentActiveMutation = useMutation({
    mutationFn: (variables: {
      document_id: string;
      currentActiveState: boolean;
      title?: string;
    }) => {
      if (!userId)
        return Promise.reject(
          new Error("User ID is not available for toggling state."),
        );
      return toggleDocumentActiveFn({ ...variables, userId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      toast.success(
        `Document "${variables.title || variables.document_id}" ${data.newActiveState ? "activated" : "deactivated"}.`,
      );
    },
    onError: (error: any, variables) => {
      commonOnError(
        error,
        `Could not update status for document "${variables.title || variables.document_id}"`,
      );
    },
  });

  return {
    uploadDocument: uploadDocumentMutation,
    deleteDocument: deleteDocumentMutation,
    toggleDocumentActive: toggleDocumentActiveMutation,
  };
};
