import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "../utils/supabase/server";

const embeddingModel = openai.embedding("text-embedding-3-small");

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
  const cleanedText = value
    .normalize("NFC") // Normalize Unicode characters
    .replace(/\u0000/g, "") // Remove null characters
    .replace(/\s+/g, " ") // Clean whitespace
    .trim();

  const chunks = generateChunks(cleanedText);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  // Clean and normalize Thai text before generating embeddings
  const cleanedText = value
    .normalize("NFC") // Normalize Unicode characters
    .replace(/\u0000/g, "") // Remove null characters
    .replace(/\s+/g, " ") // Clean whitespace
    .trim();

  const { embedding } = await embed({
    model: embeddingModel,
    value: cleanedText,
  });
  return embedding;
};

interface DatabaseChunk {
  chunk: string;
  embedding: number[];
}

export const findRelevantContent = async (
  userId: string,
  question: string
): Promise<DatabaseChunk[]> => {
  const supabase = await createClient();
  const questionEmbedding = await generateEmbedding(question);

  const { data: relevantChunks, error } = await supabase.rpc(
    "match_documents",
    {
      query_embedding: questionEmbedding,
      match_threshold: 0.1,
      match_count: 100,
      user_id: userId,
    }
  );

  if (error) throw error;
  return relevantChunks;
};
