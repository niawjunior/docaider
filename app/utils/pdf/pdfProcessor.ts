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
      .replace(/\s+/g, " ") // Clean up whitespace
      .trim();

    // Split text into chunks with better context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Maximum characters per chunk
      chunkOverlap: 100, // Overlap between chunks to maintain context
      separators: ["\n\n", "\n", "。", "。", "，", "，"], // Try to split at paragraphs, then lines, then Thai punctuation
    });

    const chunks = await splitter.createDocuments([normalizedText]);
    // Filter out any empty chunks
    const filteredChunks = chunks.filter(
      (chunk) => chunk.pageContent.trim().length > 0
    );

    // Generate embeddings for each chunk
    const supabase = await createClient();

    const embeddingsArray = await Promise.all(
      filteredChunks.map(async (chunk) => {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: chunk.pageContent,
        });
        return embedding;
      })
    );

    // Create chunks with embeddings
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      chunk: chunk.pageContent,
      embedding: embeddingsArray[index],
    }));

    // Store in Supabase
    for (let i = 0; i < documentChunks.length; i++) {
      const data = {
        title,
        chunk: documentChunks[i].chunk,
        embedding: documentChunks[i].embedding,
        user_id: userId,
        document_id: documentId,
        document_name: fileName,
        active: true,
      };

      // Convert to proper JSON format
      const chunkData = {
        ...data,
        chunk: data.chunk.replace(/\u0000/g, ""), // Remove null characters before storing
      };
      const { data: result, error } = await supabase
        .from("documents")
        .upsert(chunkData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting into Supabase:", error);
        throw new Error(`Failed to insert chunk ${i + 1}: ${error.message}`);
      }

      console.log(`Successfully inserted chunk ${i + 1} with ID:`, result?.id);
    }

    console.log(
      `Successfully processed and stored ${documentChunks.length} chunks`
    );
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

    // Get the public URL
    const { data: publicUrl } = supabase.storage
      .from("documents")
      .getPublicUrl(storagePath);

    console.log(publicUrl);

    await processPDF(file, title, userId, storageData.id, fileName);
    return "PDF uploaded and processed successfully";
  } catch (error) {
    throw error;
  }
}
