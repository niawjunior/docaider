import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "./supabase/client";
import { db } from "../../db/config";
import { documents } from "../../db/schema";
import { and, inArray } from "drizzle-orm";

const embeddingModel = openai.embedding("text-embedding-3-large");

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
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  // Clean and normalize Thai text before generating embeddings
  const cleanedText = cleanText(value);

  const { embedding } = await embed({
    model: embeddingModel,
    value: cleanedText,
  });
  return embedding;
};

interface DatabaseChunk {
  chunk: string;
  embedding: number[];
  [key: string]: unknown;
}

export const findRelevantContent = async (
  userId: string,
  question: string,
  selectedDocumentNames?: string[]
): Promise<DatabaseChunk[]> => {
  try {
    const questionEmbedding = await generateEmbedding(question);

    // Create Supabase client
    const supabase = await createClient();

    // Get document_id from document_name using Drizzle ORM
    let documentIds: { id: number | null }[] = [];
    if (selectedDocumentNames && selectedDocumentNames.length > 0) {
      documentIds = await db
        .select({ id: documents.id })
        .from(documents)
        .where(and(inArray(documents.title, selectedDocumentNames)));

      if (documentIds.length === 0) {
        console.log("No matching documents found for the selected names");
        return [];
      }
    }

    // DROP FUNCTION IF EXISTS match_document_chunks(vector, double precision, integer);
    // DROP FUNCTION IF EXISTS match_document_chunks(vector, double precision, integer, jsonb);
    // DROP FUNCTION IF EXISTS match_selected_document_chunks(vector, double precision, integer, jsonb);
    // DROP FUNCTION IF EXISTS match_selected_document_chunks(vector, double precision, integer, jsonb, jsonb);
    // DROP FUNCTION IF EXISTS public.match_selected_document_chunks(vector, double precision, integer, jsonb);
    // DROP FUNCTION IF EXISTS public.match_selected_document_chunks(vector, double precision, integer, text[]);

    // CREATE OR REPLACE FUNCTION match_document_chunks(
    //   query_embedding vector(3072),
    //   match_threshold float,
    //   match_count int
    // )
    // RETURNS SETOF document_chunks
    // LANGUAGE sql SECURITY DEFINER
    // AS $$
    //   SELECT *
    //   FROM document_chunks
    //   WHERE document_chunks.embedding <=> query_embedding < 1 - match_threshold
    //   ORDER BY document_chunks.embedding <=> query_embedding ASC
    //   LIMIT LEAST(match_count, 200);
    // $$;

    // CREATE OR REPLACE FUNCTION match_selected_document_chunks(
    //   query_embedding vector(3072),
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

    // Use Supabase RPC for vector similarity search
    const { data: relevantChunks, error } = await supabase.rpc(
      documentIds && documentIds.length > 0
        ? "match_selected_document_chunks"
        : "match_document_chunks",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.1,
        match_count: 1000,
        ...(documentIds &&
          documentIds.length > 0 && {
            document_ids: documentIds
              .filter((d) => d.id != null)
              .map((d) => String(d.id)), // -> becomes a JSON array automatically
          }),
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
    console.error("Error finding relevant content:", error);
    throw error;
  }
};
