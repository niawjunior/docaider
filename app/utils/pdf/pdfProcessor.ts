import pdf from "pdf-parse";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { createClient } from "../supabase/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";

export interface DocumentChunk {
  chunk: string;
  embedding: number[];
}
import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
import model from "tiktoken/encoders/cl100k_base.json";
import { init, Tiktoken } from "tiktoken/lite/init";
export const config = { runtime: "edge" };

await init((imports) => WebAssembly.instantiate(wasm, imports));

async function splitUntilTokenLimit(
  text: string,
  encoder: Tiktoken,
  tokenLimit: number,
  maxDepth = 3
): Promise<string[]> {
  const tokens = encoder.encode(text);
  if (tokens.length <= tokenLimit) return [text];

  if (maxDepth === 0) {
    console.warn("Max split depth reached, skipping oversized chunk.");
    return [];
  }

  const half = Math.floor(text.length / 2);
  const left = text.slice(0, half);
  const right = text.slice(half);

  return [
    ...(await splitUntilTokenLimit(left, encoder, tokenLimit, maxDepth - 1)),
    ...(await splitUntilTokenLimit(right, encoder, tokenLimit, maxDepth - 1)),
  ];
}

export async function processPDF(
  file: File,
  title: string,
  userId?: string,
  documentId?: string,
  fileName?: string
): Promise<DocumentChunk[]> {
  try {
    // Read the file as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Parse PDF
    const data = await pdf(Buffer.from(fileBuffer));
    const text = data.text;

    // Normalize and clean the text
    const normalizedText = text
      .normalize("NFC") // Normalize Unicode characters
      .replace(/\u0000/g, "") // Remove null characters
      .replace(/\r\n/g, "\n") // Normalize newlines
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
      .replace(
        /[\u00AD\u034F\u1806\u180B-\u180E\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/g,
        ""
      ) // Remove zero-width characters
      .replace(/[\u0080-\u009F]/g, "") // Remove C1 control characters
      .replace(/\s+/g, " ") // Clean up whitespace
      .trim();

    // Add proper Thai character handling
    const thaiNormalizedText = normalizedText
      .replace(/[\u0E00-\u0E7F]/g, (match) => {
        // Handle Thai characters with proper normalization
        return match.normalize("NFC");
      })
      .replace(/[\u0E00-\u0E7F]+/g, (match) => {
        // Handle Thai word boundaries
        return match.replace(/([\u0E00-\u0E7F])/g, "$1 ");
      });
    // Split text into chunks with better context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Maximum characters per chunk
      chunkOverlap: 50, // Overlap between chunks to maintain context
      separators: ["\n\n", "\n", "。", "。", "，", "，"], // Try to split at paragraphs, then lines, then Thai punctuation
    });

    const chunks = await splitter.createDocuments([thaiNormalizedText]);
    // Filter out any empty chunks
    const filteredChunks = chunks.filter(
      (chunk) => chunk.pageContent.trim().length > 0
    );

    // Initialize the lite tokenizer
    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoder = new Tiktoken(
      model.bpe_ranks,
      model.special_tokens,
      model.pat_str
    );

    // Generate embeddings for each chunk
    const supabase = await createClient();

    // Filter chunks that fit within the 8192 token limit
    const validChunks: string[] = [];

    for (const chunk of filteredChunks) {
      const splitChunks = await splitUntilTokenLimit(
        chunk.pageContent,
        encoder,
        8192
      );
      validChunks.push(...splitChunks);
    }

    // Free WASM memory
    encoder.free();

    // Generate embeddings
    const embeddings: number[][] = await Promise.all(
      validChunks.map(async (chunkText) => {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: chunkText,
        });
        return embedding;
      })
    );

    // Create chunks with embeddings
    const documentChunks: DocumentChunk[] = validChunks.map((chunk, index) => ({
      chunk,
      embedding: embeddings[index],
    }));

    for (let i = 0; i < documentChunks.length; i++) {
      const { error } = await supabase
        .from("documents")
        .upsert({
          title,
          chunk: documentChunks[i].chunk.replace(/\u0000/g, ""),
          embedding: documentChunks[i].embedding,
          user_id: userId,
          document_id: documentId,
          document_name: fileName,
          active: true,
        })
        .select()
        .single();
      if (error) {
        console.error("Error inserting into Supabase:", error);
        throw new Error(`Failed to insert chunk ${i + 1}: ${error.message}`);
      }
    }

    return documentChunks;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process PDF");
  }
}

export async function uploadPDF(
  file: File,
  title: string,
  userId?: string
): Promise<string> {
  try {
    const supabase = await createClient();
    // Encode the filename to handle special characters
    const documentId = uuidv4();
    const fileName = `${documentId}.pdf`;

    const storagePath = `user_${userId}/${fileName}`;

    // Upload file to Supabase storage with user-specific path
    const { error: storageError, data: storageData } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      throw new Error(`Storage upload error: ${storageError.message}`);
    }

    await processPDF(file, title, userId, storageData.id, fileName);
    return "PDF uploaded and processed successfully";
  } catch (error) {
    throw error;
  }
}
