import { createServiceClient } from "./supabase/server";
import { db } from "../../db/config";
import { documents, knowledgeBases } from "../../db/schema";
import { and, inArray, eq, sql } from "drizzle-orm";
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
    dimensions: 1536, // Updated to match SQL function vector dimensions
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
// Search function for document detail field using vector similarity
export const findRelevantDocumentsByDetail = async (
  knowledgeBaseId: string,
  question: string
): Promise<
  { title: string; detail: string; documentId: string; similarity: number }[]
> => {
  try {
    const questionEmbedding = await generateEmbedding(question);

    // Get knowledge base to access its documentIds
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, knowledgeBaseId));

    if (!knowledgeBase) {
      console.error("Knowledge base not found");
      return [];
    }

    // Create Supabase service client
    const supabase = createServiceClient();

    // Use the SQL function for vector similarity search
    const { data: relevantChunks, error } = await supabase.rpc(
      "match_document_chunks",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.1, // Only include high similarity matches
        match_count: 100,
        document_ids: knowledgeBase.documentIds || [], // Pass array directly
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

    // Get document details for the matching chunks
    const documentIds = [
      ...new Set(relevantChunks.map((chunk: any) => chunk.document_id)),
    ];

    const documentsDetails = await db
      .select({
        title: documents.title,
        detail: documents.detail,
        documentId: documents.documentId,
      })
      .from(documents)
      .where(
        and(
          eq(documents.active, true),
          eq(documents.isKnowledgeBase, true),
          // Use sql template for inArray to avoid type issues
          sql`${documents.documentId} = ANY(${documentIds})`
        )
      );

    // Combine document details with similarity scores
    // Since the SQL function already sorts by similarity, we'll use the order of appearance
    // as a proxy for similarity (higher similarity = appears first)
    const documentRanks = new Map<string, number>();
    relevantChunks.forEach((chunk: any, index: number) => {
      const docId = chunk.document_id;
      if (!documentRanks.has(docId)) {
        documentRanks.set(docId, index);
      }
    });

    return documentsDetails.map((doc: any) => {
      const rank = documentRanks.get(doc.documentId) || 0;
      // Convert rank to similarity score (lower rank = higher similarity)
      const similarity = Math.max(0, 1 - rank / relevantChunks.length);
      return {
        title: doc.title,
        detail: doc.detail,
        documentId: doc.documentId,
        similarity,
      };
    });
  } catch (error) {
    console.error("Error finding relevant documents by detail:", error);
    return [];
  }
};

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
      "match_document_chunks",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.1,
        match_count: 10,
        document_ids: documentIds
          .filter((d) => d.id != null)
          .map((d) => String(d.id)), // Pass array directly
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
