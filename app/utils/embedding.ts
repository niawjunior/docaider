import { createServiceClient } from "./supabase/server";
import { db } from "../../db/config";
import { knowledgeBases } from "../../db/schema";
import { eq } from "drizzle-orm";
import { OpenAIEmbeddings } from "@langchain/openai";

import { encodingForModel, getEncoding } from "js-tiktoken";

const MAX_TOKENS = 8191; // Leave a small buffer

const truncateTextToTokens = (text: string, maxTokens: number = MAX_TOKENS): string => {
  try {
    // text-embedding-3-large uses cl100k_base encoding
    const enc = getEncoding("cl100k_base");
    const tokens = enc.encode(text);
    
    if (tokens.length <= maxTokens) {
      return text;
    }
    
    const truncatedTokens = tokens.slice(0, maxTokens);
    return enc.decode(truncatedTokens);
  } catch (e) {
    console.error("Error truncating text:", e);
    // Fallback to character truncation if tokenization fails
    // Approx 4 chars per token
    return text.slice(0, maxTokens * 4);
  }
};

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

  const chunks = generateChunks(cleanedText).map(chunk => truncateTextToTokens(chunk));

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
  const cleanedText = truncateTextToTokens(cleanText(value));

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    dimensions: 1536,
  });

  const [embedding] = await embeddings.embedDocuments([cleanedText]);
  return embedding;
};

interface SearchResult {
  title: string;
  detail: string;
  documentId: string;
  content: string | null;
  similarity: number;
}

// Internal helper function to perform the vector search
const searchVectors = async (
  knowledgeBaseId: string,
  question: string
): Promise<SearchResult[]> => {
  try {
    const questionEmbedding = await generateEmbedding(question);

    // Get knowledge base to access its documentIds and check its own detail
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
    const results: SearchResult[] = [];

    // 1. Check Knowledge Base Detail Match
    // If the KB has a detail embedding, check similarity with the question
    if (knowledgeBase.detail && knowledgeBase.detailEmbedding) {
      // Calculate cosine similarity manually or via a simple query if possible
      // Since we can't easily do vector math in JS on raw arrays without a library,
      // and we want to use the database's optimized index, we'll query the KB table.
      
      // Note: We need a way to search the KB table itself. 
      // For now, we'll assume we can use a direct query to check THIS specific KB's similarity.
      const { data: kbMatch, error: kbError } = await supabase.rpc(
        "match_knowledge_base_detail", 
        {
          query_embedding: questionEmbedding,
          match_threshold: 0.01,
          kb_id: knowledgeBaseId
        }
      );
      
      if (!kbError && kbMatch && kbMatch.length > 0) {
        results.push({
          title: `Knowledge Base: ${knowledgeBase.name}`,
          detail: knowledgeBase.detail,
          documentId: knowledgeBaseId,
          content: `Knowledge Base Context: ${knowledgeBase.detail}`,
          similarity: kbMatch[0].similarity
        });
      }
    }

    // 2. Search Documents and Chunks
    const { data: docResults, error } = await supabase.rpc(
      "match_documents_by_detail_and_content",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.01, // Very low threshold to ensure we get results
        match_count: 100,
        document_ids: knowledgeBase.documentIds || [], // Pass array directly
      }
    );

    console.log("KB Document IDs:", knowledgeBase.documentIds);
    console.log("Doc Results Count:", docResults?.length);
    if (error) console.error("Doc Search Error:", error);

    if (error) {
      console.error("Error in vector search:", error);
      // Don't throw here, just return what we have (maybe KB match)
    } else if (docResults && docResults.length > 0) {
      // Transform results to match expected format
      const transformedResults = docResults.map((row: any) => ({
        title: row.title,
        detail: row.detail,
        documentId: row.document_id,
        content: row.chunk_content,
        similarity: row.similarity,
      }));
      results.push(...transformedResults);
    }

    // Sort combined results by similarity
    return results.sort((a, b) => b.similarity - a.similarity);

  } catch (error: any) {
    console.error("Error in searchVectors:", error);
    return [];
  }
};

// Search function for document detail field using vector similarity
export const findRelevantDocumentsByDetail = async (
  knowledgeBaseId: string,
  question: string
): Promise<SearchResult[]> => {
  return searchVectors(knowledgeBaseId, question);
};

// Function to process a document that's missing embeddings or chunks
export const processDocumentForSearch = async (
  documentId: string
): Promise<boolean> => {
  try {
    console.log("Processing document for search:", documentId);
    const supabase = createServiceClient();

    // Get document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("document_id", documentId)
      .single();

    if (docError || !document) {
      console.error("Document not found:", docError);
      return false;
    }

    // Generate detail embedding if missing
    if (!document.detail_embedding && document.detail) {
      console.log("Generating detail embedding...");
      const detailEmbedding = await generateEmbedding(document.detail);

      const { error: updateError } = await supabase
        .from("documents")
        .update({ detail_embedding: detailEmbedding })
        .eq("document_id", documentId);

      if (updateError) {
        console.error("Error updating detail embedding:", updateError);
        return false;
      } else {
        console.log("Detail embedding updated successfully");
      }
    }

    return true;
  } catch (error: any) {
    console.error("Error processing document:", error);
    return false;
  }
};

// Function to generate embedding for a Knowledge Base detail
export const processKnowledgeBaseDetail = async (
  knowledgeBaseId: string
): Promise<boolean> => {
  try {
    console.log("Processing KB detail for search:", knowledgeBaseId);

    // Get KB
    const [kb] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, knowledgeBaseId));

    if (!kb) {
      console.error("Knowledge Base not found");
      return false;
    }

    console.log("Knowledge Base detail:", kb.detail);
    // Generate detail embedding if missing or if detail exists
    if (kb.detail) {
      console.log("Generating KB detail embedding...");
      const detailEmbedding = await generateEmbedding(kb.detail);

      // Update using Drizzle since we have the schema
      await db
        .update(knowledgeBases)
        .set({ detailEmbedding: detailEmbedding })
        .where(eq(knowledgeBases.id, knowledgeBaseId));
        
      console.log("KB detail embedding updated successfully");
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error("Error processing KB detail:", error);
    return false;
  }
};
