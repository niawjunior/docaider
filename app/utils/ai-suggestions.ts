import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function generateSuggestions(context: string) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        questions: z.array(z.string()).describe("Array of 3 short questions in Thai"),
      }),
      prompt: `
        Analyze the following context data and generate 3 short, simple, and relevant questions in Thai that a user might ask about this data.
        
        Context:
        ${context.length > 5000 ? context.slice(0, 5000) : context}

        Requirements:
        1. Questions must be in Thai.
        2. Questions must be short (under 40 characters if possible).
        3. Questions must be directly answerable from the context.
        4. Tone: Friendly, helpful, and professional.
        5. **CRITICAL**: Do NOT generate negative or troubleshooting questions like "Why is X not found?" or "Is X missing?".
        6. Focus on the most common, natural, and relevant questions a user would ask to understand this specific data.
        7. Identify the main entities or topics in the data and ask about their key attributes, summaries, or relationships.
      `,
    });
    return object.questions;
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}
