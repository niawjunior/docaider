import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, instruction } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        improvedText: z.string().describe("The improved version of the text"),
      }),
      prompt: `
        You are an expert professional resume editor.
        Your task is to improve the following text based on the user's instruction.
        
        Original Text:
        "${text}"

        User Instruction:
        "${instruction || "Improve grammar, clarity, and professionalism."}"

        Requirements:
        1. Maintain the original meaning usually, unless told otherwise.
        2. Use professional, action-oriented language suitable for a resume.
        3. Do not add conversational filler (e.g., "Here is the improved text"). Just return the text.
        4. If the instruction is specific (e.g., "Make it shorter"), prioritize that.
      `,
    });

    return NextResponse.json({ improvedText: object.improvedText });
  } catch (error) {
    console.error("Error improving text:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
