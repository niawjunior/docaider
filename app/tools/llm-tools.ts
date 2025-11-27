import { tool } from "ai";
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { createClient } from "../utils/supabase/server";
import { findRelevantDocumentsByDetail } from "../utils/embedding";
export const createAskQuestionTool = (config?: {
  knowledgeBaseId?: string;
  isEmbed?: boolean;
}) =>
  tool({
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
      knowledgeBaseId: config?.knowledgeBaseId
        ? z.string().optional().describe("Knowledge base ID (optional if already provided)")
        : z.string().describe("Knowledge base ID"),
      language: z
        .string()
        .describe("The language to ask the question. Example: en, th"),
    }),
    execute: async ({ question, knowledgeBaseId, language }) => {
      try {
        // Use provided config ID if available, otherwise use input ID
        const targetKbId = config?.knowledgeBaseId || knowledgeBaseId;

        if (!targetKbId) {
          throw new Error("Knowledge Base ID is required");
        }

        if (!config?.isEmbed) {
          const supabase = await createClient();
          const { data: user } = await supabase.auth.getUser();

          if (!user?.user?.id) {
            throw new Error("User not authenticated");
          }
        }

        // Get relevant chunks from both document content and detail field
        const relevantDocuments = await findRelevantDocumentsByDetail(
          targetKbId,
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
            (doc) => doc.similarity > 0.3 // Increased from 0.1 to filter out noise
          );

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
              }`;
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

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt,
          system: `You are a helpful assistant that can answer questions based on current documents. Format your responses clearly and professionally:
      
      IMPORTANT:
      - If the user asks for documents (e.g., "which documents...", "documents that..."), you MUST list the titles of the documents found in the "Document:" sections of the context.
      - Do NOT just explain the concept from the "Context:" section. You must link it to the specific "Document:".
      
      IMPORTANT: Citation Rules
      - IF you use information from a document to answer the question, you MUST cite it.
      - At the end of your answer, include a section titled "References" or "เอกสารอ้างอิง" (depending on language).
      - List ONLY the document titles that contained the information you used.
      - If the question is a greeting (e.g., "Hi", "Hello") or general conversation NOT requiring document info, do NOT include a References section.
      - Do NOT cite sources labeled as "Context:". Only cite "Document:".

      Please:
        - Must return the article in ${language} language.
      `,
        });

        return text;
      } catch (error: any) {
        console.error("Error in askQuestionTool:", error);
        throw new Error("Failed to process question: " + error.message);
      }
    },
  });

export const askQuestionTool = createAskQuestionTool();

export const finishTool = tool({
  description: "A tool for the model to call when it has finished its work.",
  inputSchema: z.object({
    answer: z.string().describe("The final answer to the user's question."),
  }),
  execute: async ({ answer }) => {
    return answer;
  },
});
