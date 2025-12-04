import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();

    if (!context) {
      return NextResponse.json({ questions: [] });
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        questions: z.array(z.string()).describe("Array of 3 short questions in Thai"),
      }),
      prompt: `
        Analyze the following context data and generate 3 short, simple, and relevant questions in Thai that a user might ask about this data.
        
        Context:
        ${typeof context === 'string' ? context : JSON.stringify(context).slice(0, 5000)}

        Requirements:
        1. Questions must be in Thai.
        2. Questions must be short (under 40 characters if possible).
        3. Questions must be directly answerable from the context.
        4. Tone: Friendly and helpful.
      `,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ questions: [] }, { status: 500 });
  }
}
