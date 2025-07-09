import { createClient } from "../supabase/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";

import { db } from "../../../db/config";
import { documents } from "../../../db/schema";

export interface DocumentChunk {
  chunk: string;
  embedding: number[];
}

const fileLoader = async (file: File): Promise<Document[]> => {
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

const pdfLoader = async (file: File) => {
  const loader = new PDFLoader(file);
  const docs = await loader.load();
  return docs;
};

const csvLoader = async (file: File) => {
  const loader = new CSVLoader(file, {
    separator: ",",
  });
  const docs = await loader.load();
  return docs;
};

const docLoader = async (file: File) => {
  const loader = new DocxLoader(file, {
    type: "doc",
  });
  const docs = await loader.load();
  return docs;
};

const docxLoader = async (file: File) => {
  const loader = new DocxLoader(file, {
    type: "docx",
  });
  const docs = await loader.load();
  return docs;
};

export async function processFile(
  file: File,
  title: string,
  userId?: string,
  documentId?: string,
  fileName?: string
): Promise<Document[]> {
  try {
    // Parse file
    const data = await fileLoader(file);

    // Split text into chunks with better context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100, // Maximum characters per chunk
      chunkOverlap: 0, // Overlap between chunks to maintain context
    });
    const chunks = await splitter.splitDocuments(data);

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const chunkEmbeddings = await embeddings.embedDocuments(
      chunks.map((d) => d.pageContent)
    );

    // Use Drizzle ORM to insert documents
    for (let i = 0; i < chunks.length; i++) {
      try {
        await db.insert(documents).values({
          title,
          chunk: chunks[i].pageContent,
          embedding: chunkEmbeddings[i],
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

    return chunks;
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
