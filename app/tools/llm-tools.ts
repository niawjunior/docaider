import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

import { createClient } from "../utils/supabase/server";
import { findRelevantDocumentsByDetail } from "../utils/embedding";
export const askQuestionTool = tool({
  description: `Use this tool to **answer questions based on current documents**, acting as your intelligent knowledge base.

  ✅ **Required for**:
  - Any question related to the content of current documents.
  - Retrieving specific information from your knowledge base.

  🧠 **Behavior**:
  - Only respond to questions using information directly from tool calls.
  - If no relevant information is found, respond with "No relevant documents found for this question."
  - Responses will be formatted using markdown, including headings, bullet points, and chronological order for date/time questions.
  - **Always ask for document names to filter the search**.
  `,
  inputSchema: z.object({
    question: z.string().describe("Question to ask about the documents"),
    knowledgeBaseId: z.string().describe("Knowledge base ID"),
    language: z
      .string()
      .describe("The language to ask the question. Example: en, th"),
  }),
  execute: async ({ question, knowledgeBaseId, language }) => {
    try {
      const supabase = await createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get relevant chunks from both document content and detail field
      const relevantDocuments = await findRelevantDocumentsByDetail(
        knowledgeBaseId,
        question
      );

      // Combine results - prioritize detail matches if they have high similarity
      let combinedContext = "";
      let hasResults = false;

      // Store document references for the final answer
      let documentReferences: string[] = [];

      // Add detail field results first (they're more specific for compliance/keyword searches)
      if (relevantDocuments && relevantDocuments.length > 0) {
        const filteredDocs = relevantDocuments.filter(
          (doc) => doc.similarity > 0.1
        ); // Only include high similarity matches

        // Store document titles for reference section
        documentReferences = [
          ...new Set(
            filteredDocs
              .filter((doc) => !doc.title.startsWith("Knowledge Base:"))
              .map((doc) => doc.title)
          ),
        ];

        const detailContext = filteredDocs
          .map((doc) => {
            const isKB = doc.title.startsWith("Knowledge Base:");
            const label = isKB ? "Context" : "Document";
            return `${label}: ${doc.title}\nContent: ${
              doc.content || doc.detail
            }\nSimilarity: ${doc.similarity.toFixed(3)}`;
          })
          .join("\n\n---\n\n");

        if (detailContext) {
          combinedContext +=
            "=== DOCUMENT DETAILS MATCH ===\n" + detailContext + "\n\n";

          combinedContext +=
            "=== DOCUMENT REFERENCES ===\n" +
            documentReferences.join("\n") +
            "\n\n";
          hasResults = true;
        }
      }

      if (!hasResults) {
        return "No relevant documents found for this question.";
      }

      console.log("--- DEBUG LLM CONTEXT ---");
      console.log("References:", documentReferences);
      console.log("Context Length:", combinedContext.length);
      // console.log("Context Preview:", combinedContext.substring(0, 500));
      console.log("-------------------------");

      // Create a prompt with the combined context
      const prompt = `Answer the following question based on the provided context:
      Question: ${question}

      Context:
      ${combinedContext}

      Answer:`;

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          answer: z
            .string()
            .describe(
              "Answer to the question. Use markdown formatting with clear headings and bullet points. For date/time questions, provide accurate dates and maintain chronological order. Reference the documents used to answer the question."
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
      console.error("Error in askQuestionTool:", error);
      throw new Error("Failed to process question: " + error.message);
    }
  },
});
