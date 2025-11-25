import { createServiceClient } from "./supabase/server";
import { db } from "../../db/config";
import { knowledgeBases } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
    // 1. (Legacy) Knowledge Base Detail Match removed in favor of chunking
    // We now search knowledge_base_chunks directly in step 3.

    // 2. Search for relevant document chunks
    const { data: docResults, error: docError } = await supabase.rpc(
      "match_documents_by_detail_and_content",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.01,
        match_count: 15, // Increased to 15 to ensure better context
        document_ids: knowledgeBase.documentIds || [],
      }
    );

    if (docError) {
      console.error("Error searching document vectors:", docError);
      throw docError;
    }

    // 3. Search for relevant Knowledge Base detail chunks
    const { data: kbResults, error: kbError } = await supabase.rpc(
      "match_knowledge_base_chunks",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.01,
        match_count: 5, // Increased to 5 to ensure better context
        kb_id: knowledgeBaseId,
      }
    );

    if (kbError) {
      console.error("Error searching KB chunks:", kbError);
      // Don't throw, just log and continue with doc results
    }

    // Format results
    const formattedDocResults = (docResults || []).map((doc: any) => ({
      id: doc.id,
      content: doc.chunk_content || doc.chunk, // Handle both field names
      similarity: doc.similarity,
      title: doc.title || doc.document_name || "Document", // Use title from SQL return
      url: doc.url,
      documentId: doc.document_id,
    }));

    const formattedKbResults = (kbResults || []).map((kb: any) => ({
      id: kb.id,
      content: kb.chunk,
      similarity: kb.similarity,
      title: `Knowledge Base: ${knowledgeBase.name}`, // Label as KB
      url: null,
      documentId: null,
    }));

    // Combine and sort by similarity
    const allResults = [...formattedDocResults, ...formattedKbResults].sort(
      (a, b) => b.similarity - a.similarity
    );

    return allResults;

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
      console.log("Processing KB detail chunks...");
      
      // 1. Generate chunks from the detail text
      // Use RecursiveCharacterTextSplitter for better semantic chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await splitter.splitText(kb.detail);
      console.log(`Generated ${chunks.length} chunks from KB detail`);

      // 2. Generate embeddings for all chunks
      const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-large",
        dimensions: 1536,
      });
      
      const embeddingVectors = await embeddings.embedDocuments(chunks);

      // 3. Store chunks in knowledge_base_chunks table
      // First, delete existing chunks for this KB to avoid duplicates
      try {
        await db.execute(sql`
          DELETE FROM knowledge_base_chunks WHERE knowledge_base_id = ${knowledgeBaseId}
        `);
      } catch (deleteError) {
        console.error("Error deleting old KB chunks:", deleteError);
        // Continue anyway
      }

      // Insert new chunks
      for (let i = 0; i < chunks.length; i++) {
        await db.execute(sql`
          INSERT INTO knowledge_base_chunks (knowledge_base_id, chunk, embedding)
          VALUES (${knowledgeBaseId}, ${chunks[i]}, ${JSON.stringify(embeddingVectors[i])}::vector)
        `);
      }
        
      console.log("KB detail chunks stored successfully");
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error("Error processing KB detail:", error);
    return false;
  }
};
