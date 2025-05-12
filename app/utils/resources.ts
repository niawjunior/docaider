import { createClient } from "../utils/supabase/server";
import { findRelevantContent, generateEmbeddings } from "./embedding";

export interface DocumentChunk {
  content: string;
  embedding: number[];
}

export const storeDocument = async (
  userId: string,
  title: string,
  content: string
): Promise<void> => {
  try {
    const supabase = await createClient();

    // Generate embeddings for the document
    const documentChunks = await generateEmbeddings(content);

    // Store in Supabase
    for (let i = 0; i < documentChunks.length; i++) {
      const data = {
        title,
        content: documentChunks[i].content,
        embedding: documentChunks[i].embedding,
        user_id: userId,
      };

      const { error } = await supabase
        .from("documents")
        .upsert(data)
        .select()
        .single();

      if (error) {
        console.error("Error inserting into Supabase:", error);
        throw new Error(`Failed to insert chunk ${i + 1}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error storing document:", error);
    throw error;
  }
};

export const getDocumentChunks = async (
  userId: string,
  question: string
): Promise<any[]> => {
  try {
    const chunks = await findRelevantContent(userId, question);
    const relevantChunks = chunks.map((chunk) => ({
      content: chunk.chunk,
      embedding: chunk.embedding,
    }));
    return relevantChunks;
  } catch (error) {
    console.error("Error getting document chunks:", error);
    throw error;
  }
};
