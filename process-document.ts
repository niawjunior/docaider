import { createServiceClient } from "./app/utils/supabase/server";
import { generateEmbeddings, generateEmbedding } from "./app/utils/embedding";

async function processDocument(documentId: string) {
  const supabase = createServiceClient();

  try {
    console.log("Processing document:", documentId);

    // Get the document details
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("document_id", documentId)
      .single();

    if (docError || !document) {
      console.error("Document not found:", docError);
      return;
    }

    console.log("Found document:", document.title);

    // Generate detail embedding
    if (!document.detail_embedding && document.detail) {
      console.log("Generating detail embedding...");
      const detailEmbedding = await generateEmbedding(document.detail);

      const { error: updateError } = await supabase
        .from("documents")
        .update({ detail_embedding: detailEmbedding })
        .eq("document_id", documentId);

      if (updateError) {
        console.error("Error updating detail embedding:", updateError);
      } else {
        console.log("Detail embedding updated successfully");
      }
    }

    // If document has content that needs to be chunked, you would need to:
    // 1. Get the actual document content (from URL, file, etc.)
    // 2. Split it into chunks
    // 3. Generate embeddings for each chunk
    // 4. Insert chunks into document_chunks table

    console.log("Document processing completed");
  } catch (error) {
    console.error("Error processing document:", error);
  }
}

// Process the specific document
processDocument("fedc12ab-1b3b-4a1f-9bff-068fba2ddf51");
