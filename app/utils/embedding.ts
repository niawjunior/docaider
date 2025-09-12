import { createServiceClient } from "./supabase/server";
import { db } from "../../db/config";
import { documents, knowledgeBases } from "../../db/schema";
import { and, inArray, eq } from "drizzle-orm";
import { OpenAIEmbeddings } from "@langchain/openai";

const cleanText = (input: string): string => {
  return input
    .normalize("NFC") // Normalize Unicode characters
    .replace(/\u0000/g, "") // Remove null characters
    .replace(/\s+/g, " ") // Clean whitespace
    .trim();
};

export const generateChunks = (input: string): string[] => {
  // Split Thai text using spaces and punctuation
  return input
    .trim()
    .split(/([\s。,，]+)/) // Split on spaces and Thai punctuation
    .filter((i) => i.trim() !== "")
    .map((chunk) => chunk.trim());
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  // Clean and normalize Thai text before generating embeddings
  const cleanedText = cleanText(value);

  const chunks = generateChunks(cleanedText);

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    dimensions: 1536,
  });

  const embeddingVectors = await embeddings.embedDocuments(chunks);

  return chunks.map((content, i) => ({
    content,
    embedding: embeddingVectors[i],
  }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  // Clean and normalize Thai text before generating embeddings
  const cleanedText = cleanText(value);

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    dimensions: 1536,
  });

  const [embedding] = await embeddings.embedDocuments([cleanedText]);
  return embedding;
};

interface DatabaseChunk {
  chunk: string;
  embedding: number[];
  [key: string]: unknown;
}

// -- Create a named HNSW index on the public.document_chunks.embedding column
// CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
// ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

// DROP FUNCTION IF EXISTS match_document_chunks(vector, double precision, integer);
// DROP FUNCTION IF EXISTS match_document_chunks(vector, double precision, integer, jsonb);
// DROP FUNCTION IF EXISTS match_selected_document_chunks(vector, double precision, integer, jsonb);
// DROP FUNCTION IF EXISTS match_selected_document_chunks(vector, double precision, integer, jsonb, jsonb);
// DROP FUNCTION IF EXISTS public.match_selected_document_chunks(vector, double precision, integer, jsonb);
// DROP FUNCTION IF EXISTS public.match_selected_document_chunks(vector, double precision, integer, text[]);

// CREATE OR REPLACE FUNCTION match_selected_document_chunks(
//   query_embedding vector(1536),
//   match_threshold float,
//   match_count int,
//   document_ids jsonb  -- Array of document IDs to filter by
// )
// RETURNS SETOF document_chunks
// LANGUAGE sql SECURITY DEFINER
// AS $$
//   SELECT *
//   FROM document_chunks
//   WHERE document_chunks.document_id IN (
//     SELECT value FROM jsonb_array_elements_text(document_ids)
//   )
//   AND document_chunks.embedding <=> query_embedding < 1 - match_threshold
//   ORDER BY document_chunks.embedding <=> query_embedding ASC
//   LIMIT LEAST(match_count, 200);
// $$;

// Special version of findRelevantContent for embed context that doesn't require user authentication
export const findRelevantContent = async (
  knowledgeBaseId: string,
  question: string,
  selectedDocumentNames?: string[]
): Promise<DatabaseChunk[]> => {
  try {
    const questionEmbedding = await generateEmbedding(question);

    // Create Supabase service client (no user auth required)
    const supabase = createServiceClient();

    // Get the knowledge base to access its documentIds
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, knowledgeBaseId));

    if (!knowledgeBase) {
      console.error("Knowledge base not found");
      return [];
    }

    // Get document_id from document_name using Drizzle ORM
    let documentIds: { id: number | null }[] = [];

    if (selectedDocumentNames && selectedDocumentNames.length > 0) {
      // Filter by both knowledge base documentIds and selected document names
      documentIds = await db
        .select({ id: documents.id })
        .from(documents)
        .where(
          and(
            inArray(documents.title, selectedDocumentNames),
            knowledgeBase.documentIds && knowledgeBase.documentIds.length > 0
              ? inArray(documents.documentId, knowledgeBase.documentIds)
              : eq(documents.id, -1) // No matching documents if empty array
          )
        );
    } else if (
      knowledgeBase.documentIds &&
      knowledgeBase.documentIds.length > 0
    ) {
      // Just filter by knowledge base documentIds
      documentIds = await db
        .select({ id: documents.id })
        .from(documents)
        .where(inArray(documents.documentId, knowledgeBase.documentIds));
    }

    if (documentIds.length === 0) {
      console.log("No matching documents found for the knowledge base");
      return [];
    }
    // Use Supabase RPC for vector similarity search
    const { data: relevantChunks, error } = await supabase.rpc(
      "match_selected_document_chunks",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.1,
        match_count: 10,
        document_ids: documentIds
          .filter((d) => d.id != null)
          .map((d) => String(d.id)),
      }
    );

    if (error) {
      console.error("Error in vector search:", error);
      throw new Error(`Vector search failed: ${error.message}`);
    }

    if (!relevantChunks || relevantChunks.length === 0) {
      console.log("No relevant content found");
      return [];
    }

    return relevantChunks as DatabaseChunk[];
  } catch (error) {
    console.error("Error finding relevant content for embed:", error);
    throw error;
  }
};
