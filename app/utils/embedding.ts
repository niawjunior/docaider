import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "./supabase/client";
import { db } from "../../db/config";
import { documents } from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

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
        .where(
          and(
            eq(documents.userId, userId),
            eq(documents.active, true),
            inArray(documents.title, selectedDocumentNames)
          )
        );

      if (documentIds.length === 0) {
        console.log("No matching documents found for the selected names");
        return [];
      }
    }
    // Use Supabase RPC for vector similarity search
    const { data: relevantChunks, error } = await supabase.rpc(
      documentIds && documentIds.length > 0
        ? "match_selected_document_chunks"
        : "match_document_chunks",
      {
        query_embedding: questionEmbedding,
        user_id: userId,
        match_threshold: 0.1, // Adjust threshold as needed
        match_count: 1000, // Maximum number of matches to return
        ...(documentIds &&
          documentIds.length > 0 && {
            document_ids: documentIds.map((d) => d.id),
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
