import { tool, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// createEmbedAskQuestionTool removed - using shared createAskQuestionTool from llm-tools.ts

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

export const createContextTool = (contextData: {
  prompt: string;
  content: string;
}) =>
  tool({
    description: `Use this tool to **access the specific context** provided by the user for the action: "${contextData.prompt}".
    
    ✅ **Required for**:
    - Answering questions related to "${contextData.prompt}".
    - Accessing the data or content associated with "${contextData.prompt}".
    - Performing actions on the provided context.
    `,
    inputSchema: z.object({
      action: z.string().describe(`The specific action or topic being accessed, typically "${contextData.prompt}"`),
    }),
    execute: async ({ action }) => {
      // Return the content directly to the main LLM
      // This avoids a secondary LLM call and reduces latency
      return {
        action: action || contextData.prompt,
        content: contextData.content,
        instruction: `Here is the content for "${contextData.prompt}". Use this information to answer the user's question or fulfill their request.`
      };
    },
  });
