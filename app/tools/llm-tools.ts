import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

import { createClient } from "../utils/supabase/server";
import { findRelevantContent } from "../utils/embedding";

export const askQuestionTool = tool({
  description: `Use this tool to **answer questions based on the user's uploaded documents**, acting as your intelligent knowledge base.

  ✅ **Required for**:
  - Any question related to the content of uploaded documents.
  - Retrieving specific information from your knowledge base.

  - If current document count is more than 1, you **MUST** Ask user to specify the document name to filter the search.
  🧠 **Behavior**:
  - Only respond to questions using information directly from tool calls.
  - If no relevant information is found, respond with "No relevant documents found for this question."
  - Responses will be formatted using markdown, including headings, bullet points, and chronological order for date/time questions.
  - **Always ask for document names to filter the search**.
  `,
  parameters: z.object({
    question: z.string().describe("Question to ask about the documents"),
    language: z
      .string()
      .describe("The language to ask the question. Example: en, th"),
    selectedDocumentNames: z
      .array(z.string())
      .describe("Must ask for document names to filter the search"),
  }),
  execute: async ({ question, language, selectedDocumentNames }) => {
    try {
      const supabase = await createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get relevant chunks using our utility function
      const relevantChunks = await findRelevantContent(
        user.user.id,
        question,
        selectedDocumentNames
      );

      if (!relevantChunks || relevantChunks.length === 0) {
        return "No relevant documents found for this question.";
      }

      // Combine relevant chunks into a single context
      const context = relevantChunks.map((chunk) => chunk.chunk).join("\n\n");

      // Create a prompt with the context
      const prompt = `Answer the following question based on the provided context:
      Question: ${question}

      Context:
      ${context}

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
        system: `You are a helpful assistant that can answer questions based on uploaded documents. Format your responses clearly and professionally:

      Please:
        - Must return the article in ${language} language.
        
      # Formatting Guidelines
      - Use clear, descriptive headings (## Heading)
      - Use bullet points (•) for lists WITHOUT trailing periods
      - Use numbered lists (1., 2., etc.) for steps WITHOUT trailing periods
      - Use backticks (\`) for code snippets
      - Use **bold** for important terms
      - Use *italic* for emphasis

      # Markdown Formatting Rules
      - Do NOT end bullet points with periods
      - Keep formatting consistent throughout the document
      - Ensure proper spacing between list items
      - Maintain clean, readable formatting for all languages
      
      # Thai Language Handling
      - For Thai text, ensure proper UTF-8 encoding
      - Preserve all Thai vowels, tone marks, and special characters
      - When formatting Thai text in bullet points or lists:
        • Ensure all characters are properly rendered
        • Maintain proper spacing between Thai words
        • Always normalize Thai text using Unicode NFC normalization
        • Check that vowels and tone marks are correctly positioned


      # Date/Time Handling
      - When answering date-related questions:
        • Today is ${new Date().toISOString()}
        • Always provide accurate dates from the document
        • Maintain chronological order
        • Compare dates relative to current date
        • Format dates consistently (YYYY-MM-DD or full date format)
        • For "next" or "upcoming" questions:
          - Sort dates chronologically
          - Return the first date that's in the future
          - Include days until the event

      # Response Structure
      ## Summary
      - Start with a clear, concise summary
      - Use **bold** for key points

      ## Steps
      1. Numbered steps for procedures
      2. Clear, actionable instructions

      ## Options
      • Bullet points for alternatives
      • Clear separation of ideas

      ## Code
      \`\`\`javascript
      // Example code block
      \`\`\`

      # Example of Proper Formatting
      ## Authentication Requirements
      • For "Read-only" feature:
        • C-4 (Confidential): Requires two-factor authentication
        • C-3 (Confidential): Requires one-factor authentication
      • For "Write/Update" feature:
        • I-4 (Critical Integrity): Requires two-factor authentication
        • I-3 (High Integrity): Requires one-factor authentication

      # Tools
      - Use the askQuestion tool to retrieve information
      - Format responses for ReactMarkdown compatibility

      `,
      });

      return object.answer;
    } catch (error: any) {
      console.error("Error in askQuestionTool:", error);
      throw new Error("Failed to process question: " + error.message);
    }
  },
});
