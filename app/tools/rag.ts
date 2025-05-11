// system: `You are a helpful assistant that can answer questions based on uploaded documents.
// Use the uploadDocument tool to process new documents.
// Use the askQuestion tool to retrieve relevant information from existing documents.
// Always provide accurate and contextually relevant answers.`

// import { tool } from "ai";
// import { z } from "zod";
// import pdf from "pdf-parse";
// import { createClient } from "../utils/supabase/server";

// // Schema for document upload
// const documentSchema = z.object({
//   file: z.any().describe("PDF file to upload"),
//   title: z.string().describe("Title of the document"),
// });

// // Schema for question
// const questionSchema = z.object({
//   question: z.string().describe("Question to ask about the documents"),
// });

// export const uploadDocumentTool = tool({
//   description:
//     "Upload and process a PDF document for RAG. The document will be split into chunks and stored in the vector database.",
//   parameters: documentSchema,
//   execute: async ({ file, title }) => {
//     try {
//       // Parse PDF
//       const data = await pdf(file);
//       const text = data.text;

//       // Split text into chunks (you might want to implement a better chunking strategy)
//       const chunks = text
//         .split("\n\n")
//         .filter((chunk) => chunk.trim().length > 0);

//       // Store chunks in Supabase with embeddings
//       const supabase = await createClient();
//       const { data: embeddings } = await supabase.rpc("get_embeddings", {
//         texts: chunks,
//       });

//       // Store chunks and embeddings in Supabase
//       for (let i = 0; i < chunks.length; i++) {
//         await supabase.from("documents").insert({
//           title,
//           chunk: chunks[i],
//           embedding: embeddings[i],
//           created_at: new Date().toISOString(),
//         });
//       }

//       return {
//         success: true,
//         message: "Document uploaded and processed successfully",
//       };
//     } catch (error) {
//       console.error("Error processing document:", error);
//       throw new Error("Failed to process document");
//     }
//   },
// });

// export const askQuestionTool = tool({
//   description:
//     "Ask a question about the uploaded documents. The tool will retrieve relevant chunks and generate an answer.",
//   parameters: questionSchema,
//   execute: async ({ question }) => {
//     try {
//       const supabase = await createClient();

//       // Get embedding for the question
//       const { data: questionEmbedding } = await supabase.rpc("get_embeddings", {
//         texts: [question],
//       });

//       // Find similar chunks
//       const { data: relevantChunks } = await supabase
//         .from("documents")
//         .select("*")
//         .order("created_at", { ascending: false })
//         .limit(5); // Get top 5 relevant chunks

//       // Format context for the model
//       const context = relevantChunks.map((chunk) => chunk.chunk).join("\n\n");

//       return {
//         context,
//         relevant_chunks: relevantChunks.map((chunk) => ({
//           title: chunk.title,
//           content: chunk.chunk,
//         })),
//       };
//     } catch (error) {
//       console.error("Error asking question:", error);
//       throw new Error("Failed to retrieve relevant information");
//     }
//   },
// });
