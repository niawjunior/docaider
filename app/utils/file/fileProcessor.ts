import { createClient } from "../supabase/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";

import { db } from "../../../db/config";
import { documentChunks, documents } from "../../../db/schema";

export interface DocumentChunk {
  chunk: string;
  embedding: number[];
}

const fileLoader = async (file: File): Promise<string> => {
  const fileExtension = file.name.split(".").pop();
  switch (fileExtension) {
    case "pdf":
      return await pdfLoader(file);
    case "csv":
      return await csvLoader(file);
    case "doc":
      return await docLoader(file);
    case "docx":
      return await docxLoader(file);
    default:
      throw new Error("Unsupported file type");
  }
};

const cleanText = (input: string): string => {
  return input
    .normalize("NFC") // Normalize Unicode characters
    .replace(/\u0000/g, "") // Remove null characters
    .replace(/\s+/g, " ") // Clean whitespace
    .trim();
};

const pdfLoader = async (file: File): Promise<string> => {
  const loader = new PDFLoader(file);
  const docs = await loader.load();
  return cleanText(docs.map((d) => d.pageContent).join("\n"));
};

const csvLoader = async (file: File): Promise<string> => {
  const loader = new CSVLoader(file, {
    separator: ",",
  });
  const docs = await loader.load();
  return cleanText(docs.map((d) => d.pageContent).join("\n"));
};

const docLoader = async (file: File): Promise<string> => {
  const loader = new DocxLoader(file, {
    type: "doc",
  });
  const docs = await loader.load();
  return cleanText(docs.map((d) => d.pageContent).join("\n"));
};

const docxLoader = async (file: File): Promise<string> => {
  const loader = new DocxLoader(file, {
    type: "docx",
  });
  const docs = await loader.load();
  return cleanText(docs.map((d) => d.pageContent).join("\n"));
};

export async function processFile(
  file: File,
  title: string,
  userId?: string,
  documentId?: string,
  fileName?: string,
  isKnowledgeBase = false,
  publicUrl?: string
): Promise<string[]> {
  try {
    // Parse file
    const data = await fileLoader(file);

    // Split text into chunks with better context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Maximum characters per chunk
      chunkOverlap: 0, // Overlap between chunks to maintain context
    });
    const chunks = await splitter.splitText(data);

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const chunkEmbeddings = await embeddings.embedDocuments(
      chunks.map((d) => d)
    );

    // First, insert the main document record
    let mainDocumentId;
    try {
      const result = await db
        .insert(documents)
        .values({
          title,
          documentName: fileName,
          documentId: documentId, // This is the knowledge base ID if applicable
          userId,
          isKnowledgeBase,
          active: true,
          url: publicUrl,
        })
        .returning({ insertedId: documents.id });

      mainDocumentId = result[0].insertedId;
    } catch (error) {
      console.error("Error inserting main document:", error);
      throw new Error("Failed to insert main document record");
    }

    // Then insert all chunks referencing the main document
    for (let i = 0; i < chunks.length; i++) {
      try {
        await db.insert(documentChunks).values({
          documentId: mainDocumentId.toString(), // Reference to the main document
          chunk: chunks[i],
          embedding: chunkEmbeddings[i],
          userId,
          active: true,
          isKnowledgeBase,
        });
      } catch (error) {
        console.error("Error inserting document chunk with Drizzle:", error);
        throw new Error(`Failed to insert chunk ${i + 1}`);
      }
    }

    return chunks;
  } catch (error) {
    console.error("Error processing File:", error);
    throw new Error("Failed to process File");
  }
}

export async function uploadFile(
  file: File,
  title: string,
  userId?: string,
  isKnowledgeBase = false
): Promise<{ success: boolean; message: string; documentId: string }> {
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

    const publicUrl = `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/public/${storageData!.fullPath}`;
    if (storageError) {
      throw new Error(`Storage upload error: ${storageError.message}`);
    }

    await processFile(
      file,
      title,
      userId,
      storageData.id,
      fileName,
      isKnowledgeBase,
      publicUrl
    );
    return {
      success: true,
      message: "File uploaded and processed successfully",
      documentId: storageData.id,
    };
  } catch (error) {
    console.log(error);
    console.error("Error uploading file:", error);
    return {
      success: false,
      message: "Failed to upload file",
      documentId: "",
    };
  }
}
