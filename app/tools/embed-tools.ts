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
    - Performing the action "${contextData.prompt}" on the provided content.
    - Content is provided by the user for the action: "${contextData.content}".
    - Understanding the specific text or data the user wants you to process.
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
        instruction: `The user wants you to perform the action "${contextData.prompt}" on this content. Please fulfill the request.`
      };
    },
  });
