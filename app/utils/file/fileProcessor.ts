import pdf from "pdf-parse";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { createClient } from "../supabase/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

import { db } from "../../../db/config";
import { documents } from "../../../db/schema";

export interface DocumentChunk {
  chunk: string;
  embedding: number[];
}

import { Tiktoken } from "js-tiktoken/lite";
import cl100k_base from "js-tiktoken/ranks/cl100k_base";

async function splitUntilTokenLimit(
  text: string,
  encoder: Tiktoken,
  tokenLimit: number,
  maxDepth = 5
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

const fileLoader = (file: File) => {
  const fileExtension = file.name.split(".").pop();
  switch (fileExtension) {
    case "pdf":
      return pdfLoader(file);
    case "csv":
      return csvLoader(file);
    case "doc":
      return docLoader(file);
    case "docx":
      return docxLoader(file);
    default:
      throw new Error("Unsupported file type");
  }
};

const pdfLoader = async (file: File) => {
  // Read the file as an ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Parse PDF
  const data = await pdf(Buffer.from(fileBuffer));
  return data.text;
};

const csvLoader = async (file: File) => {
  const loader = new CSVLoader(file, {
    separator: ",",
  });
  const docs = await loader.load();
  const text = docs.map((doc) => doc.pageContent).join("\n");
  return text;
};

const docLoader = async (file: File) => {
  const loader = new DocxLoader(file, {
    type: "doc",
  });
  const docs = await loader.load();
  const text = docs.map((doc) => doc.pageContent).join("\n");
  return text;
};

const docxLoader = async (file: File) => {
  const loader = new DocxLoader(file, {
    type: "docx",
  });
  const docs = await loader.load();
  const text = docs.map((doc) => doc.pageContent).join("\n");
  return text;
};

export async function processFile(
  file: File,
  title: string,
  userId?: string,
  documentId?: string,
  fileName?: string
): Promise<DocumentChunk[]> {
  try {
    // Parse file
    const data = await fileLoader(file);

    // Normalize and clean the text
    const normalizedText = data
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
      chunkSize: 100, // Maximum characters per chunk
      chunkOverlap: 0, // Overlap between chunks to maintain context
    });
    const chunks = await splitter.createDocuments([thaiNormalizedText]);
    // Filter out any empty chunks
    const filteredChunks = chunks.filter(
      (chunk) => chunk.pageContent.trim().length > 0
    );
    // Initialize the lite tokenizer
    const encoder = new Tiktoken(cl100k_base);

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

    // Generate embeddings
    const embeddings: number[][] = await Promise.all(
      validChunks.map(async (chunkText) => {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-large"),
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

    // Use Drizzle ORM to insert documents
    for (let i = 0; i < documentChunks.length; i++) {
      try {
        await db.insert(documents).values({
          title,
          chunk: documentChunks[i].chunk,
          embedding: documentChunks[i].embedding,
          userId: userId,
          documentId: documentId,
          documentName: fileName,
          active: true,
        });
      } catch (error) {
        console.error("Error inserting document with Drizzle:", error);
        throw new Error(`Failed to insert chunk ${i + 1}`);
      }
    }

    return documentChunks;
  } catch (error) {
    console.error("Error processing File:", error);
    throw new Error("Failed to process File");
  }
}

export async function uploadFile(
  file: File,
  title: string,
  userId?: string
): Promise<string> {
  try {
    const supabase = await createClient();
    // Encode the filename to handle special characters
    const documentId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${documentId}.${fileExtension}`;

    const storagePath = `user_${userId}/${fileName}`;

    // We still need to use Supabase for file storage
    // Drizzle ORM doesn't handle file storage
    const { error: storageError, data: storageData } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      throw new Error(`Storage upload error: ${storageError.message}`);
    }

    await processFile(file, title, userId, storageData.id, fileName);
    return "File uploaded and processed successfully";
  } catch (error) {
    throw error;
  }
}
