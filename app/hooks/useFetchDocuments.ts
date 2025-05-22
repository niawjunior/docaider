import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client"; // Adjusted path
import { toast } from "sonner";

// Define DocumentType if not already globally available
// This is a placeholder, adjust according to your actual document structure
interface DocumentType {
  title: string;
  created_at: string;
  url: string;
  id: string;
  active: boolean;
  document_id: string;
  document_name: string;
}

const fetchDocuments = async (userId: string): Promise<DocumentType[]> => {
  if (!userId) {
    // Handle cases where userId is not available, though useQuery's enabled option is better for this
    throw new Error("User ID is required to fetch documents.");
  }

  const supabase = createClient(); // createClient might be async, ensure proper handling

  // Get all files in the user's directory
  const { data: documentsData, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching documents raw data:", error);
    throw new Error(error.message || "Failed to fetch documents data.");
  }

  // Step 2: Group by document_id to get unique documents, prioritizing the most recent if duplicates exist
  // or handle as per application logic (e.g., all chunks are items)
  // For this example, let's assume each row in 'documents' can be a unique entry for display
  // If 'documents' contains chunks and you need to group them by a parent 'document_id',
  // that logic would need to be more complex here.
  // The original ChatForm logic seemed to group them, let's replicate that.

  const grouped = new Map<string, any>(); // Using 'any' for Supabase return type flexibility
  documentsData.forEach((doc) => {
    if (!grouped.has(doc.document_id)) {
      grouped.set(doc.document_id, doc);
    }
    // Add more sophisticated grouping if needed, e.g., choosing the latest entry
    // else {
    //   const existingDoc = grouped.get(doc.document_id);
    //   if (new Date(doc.created_at) > new Date(existingDoc.created_at)) {
    //     grouped.set(doc.document_id, doc);
    //   }
    // }
  });

  // Get public URLs for each unique document
  const documentsWithUrls = await Promise.all(
    Array.from(grouped.values()).map(async (doc) => {
      const { data: publicUrlData } = await supabase.storage
        .from("documents") // Assuming 'documents' is your bucket name
        .getPublicUrl(`user_${userId}/${doc.document_name}`); // Path structure in Supabase Storage

      if (publicUrlData.publicUrl === null && !doc.url) {
        // Check if URL is already part of doc
        // This case might indicate an issue with file storage or naming conventions.
        console.warn(
          `No public URL found for document: ${doc.document_name}. File might be missing or path is incorrect.`,
        );
        // Fallback or skip if necessary, here we'll use a placeholder or existing URL if any
      }

      return {
        ...doc, // Spread existing doc properties
        title: doc.title || doc.document_name, // Ensure title exists
        created_at: doc.created_at || new Date().toISOString(),
        url: publicUrlData.publicUrl || doc.url || "#", // Use fetched URL, fallback to existing, then placeholder
        // id: doc.id, // Already spread
        // active: doc.active, // Already spread
        // document_id: doc.document_id, // Already spread
        // document_name: doc.document_name, // Already spread
      } as DocumentType; // Ensure the final object matches DocumentType
    }),
  );

  return documentsWithUrls;
};

export const useFetchDocuments = (userId: string | undefined) => {
  return useQuery<DocumentType[], Error>({
    queryKey: ["documents", userId],
    queryFn: () => {
      if (!userId) {
        return Promise.reject(new Error("User ID is not available."));
      }
      return fetchDocuments(userId);
    },
    enabled: !!userId, // Only run the query if userId is available
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    onError: (error) => {
      // Centralized error toast, or handle in component
      toast.error("Failed to load documents", {
        description: error.message,
      });
    },
  });
};
