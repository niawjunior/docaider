import { tool } from "ai";
import { z } from "zod";
import { generateObject, generateText } from "ai";
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

      // Filter relevant chunks by similarity
      const filteredChunks = relevantChunks.filter(chunk => chunk.similarity > 0.3);

      if (!filteredChunks || filteredChunks.length === 0) {
        return "No relevant documents found for this question.";
      }

      // Combine relevant chunks into a single context with labels
      const context = filteredChunks
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
          filteredChunks
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

      // Extract sources from the filtered chunks that were actually referenced
      // Note: This is a heuristic. Ideally the LLM would return structured citations.
      // For now, we return all chunks that were deemed relevant enough to be in the context,
      // or we could try to parse the "References" section from the text.
      // A safer bet for "sources used" is to return the chunks that were passed to the LLM,
      // but that might be too many.
      // Let's return the unique documents from filteredChunks.
      
      const sources = [
        ...new Map(
          filteredChunks
            .filter((chunk) => !chunk.title.startsWith("Knowledge Base:"))
            .map((chunk) => [chunk.title, { title: chunk.title, content: chunk.content || chunk.detail }])
        ).values(),
      ];

      return {
        answer: text,
        sources: sources,
      };
    } catch (error: any) {
      console.error("Error in embedAskQuestionTool:", error);
      throw new Error("Failed to process question: " + error.message);
    }
  },
});

export const createReadCurrentPageTool = (pageContent: {
  title: string;
  content: string;
  url: string;
}) =>
  tool({
    description: `Use this tool to **read the content of the current page** the user is viewing.
    
    ✅ **Required for**:
    - Answering questions about the "current page", "this page", or "what is on the screen".
    - Summarizing the current page.
    - Extracting specific information from the visible page.
    `,
    inputSchema: z.object({
      question: z
        .string()
        .describe("The specific question about the page content"),
    }),
    execute: async ({ question }) => {
      console.log("Executing readCurrentPageTool with content:", pageContent);
      if (!pageContent || !pageContent.content) {
        console.warn("Page content is empty or missing");
        return {
          error: "Page content is empty or could not be read.",
        };
      }
      return {
        source: "Current Page",
        title: pageContent.title,
        url: pageContent.url,
        content: pageContent.content,
        answer_context: `The user is asking: "${question}". Use the content provided above to answer.`,
      };
    },
  });
