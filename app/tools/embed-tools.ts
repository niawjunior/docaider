import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

import { findRelevantDocumentsByDetail } from "../utils/embedding";

export const embedAskQuestionTool = tool({
  description: `Use this tool to **answer questions based on current documents**, acting as your intelligent knowledge base.

  ✅ **Required for**:
  - Any question related to the content of current documents.
  - Retrieving specific information from your knowledge base.
  - Only respond to questions using information directly from tool calls.
  - If no relevant information is found, respond with "No relevant documents found for this question."
  - Responses will be formatted using markdown, including headings, bullet points, and chronological order for date/time questions.
  - **Always ask for document names to filter the search**.
  `,
  inputSchema: z.object({
    question: z.string().describe("Question to ask about the documents"),
    language: z
      .string()
      .describe("The language to ask the question. Example: en, th"),
    knowledgeBaseId: z
      .string()
      .describe("The ID of the knowledge base to search"),
  }),
  execute: async ({ question, language, knowledgeBaseId }) => {
    try {
      // Validate knowledgeBaseId is a UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(knowledgeBaseId)) {
        console.error("Invalid knowledgeBaseId format:", knowledgeBaseId);
        return "Error: Invalid knowledge base ID format. Please check your configuration.";
      }

      // Get relevant chunks using a modified utility function for embed context
      const relevantChunks = await findRelevantDocumentsByDetail(
        knowledgeBaseId,
        question
      );

      if (!relevantChunks || relevantChunks.length === 0) {
        return "No relevant documents found for this question.";
      }

      // Combine relevant chunks into a single context with labels
      const context = relevantChunks
        .map((chunk) => {
          const isKB = chunk.title.startsWith("Knowledge Base:");
          const label = isKB ? "Context" : "Document";
          return `${label}: ${chunk.title}\nContent: ${
            chunk.content || chunk.detail
          }`;
        })
        .join("\n\n---\n\n");

      // Create deduplicated reference list (excluding KB context)
      const documentReferences = [
        ...new Set(
          relevantChunks
            .filter((doc) => !doc.title.startsWith("Knowledge Base:"))
            .map((doc) => doc.title)
        ),
      ];

      let finalContext = context;
      if (documentReferences.length > 0) {
        finalContext += "\n\n=== DOCUMENT REFERENCES ===\n" + documentReferences.join("\n");
      }

      // Create a prompt with the context
      const prompt = `Answer the following question based on the provided context:
      Question: ${question}

      Context:
      ${finalContext}

      Answer:`;

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          answer: z
            .string()
            .describe(
              "Answer to the question. Use markdown formatting with clear headings and bullet points. For date/time questions, provide accurate dates and maintain chronological order."
            ),
        }),
        prompt,
        system: `You are a helpful assistant that can answer questions based on current documents. Format your responses clearly and professionally:
      
      IMPORTANT:
      - If the user asks for documents (e.g., "which documents...", "documents that..."), you MUST list the titles of the documents found in the "Document:" sections of the context.
      - Do NOT just explain the concept from the "Context:" section. You must link it to the specific "Document:".
      
      IMPORTANT: You must cite your sources.
      - At the end of your answer, include a section titled "References" or "เอกสารอ้างอิง" (depending on language).
      - List the document titles used to answer the question.
      - Use the titles exactly as provided in the "Document:" field of the context.
      - Do NOT cite sources labeled as "Context:". Only cite "Document:".

      Please:
        - Must return the article in ${language} language.
      `,
      });

      return object.answer;
    } catch (error: any) {
      console.error("Error in embedAskQuestionTool:", error);
      throw new Error("Failed to process question: " + error.message);
    }
  },
});
