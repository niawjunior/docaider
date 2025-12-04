import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/config";
import { knowledgeBases } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { generateSuggestions } from "@/app/utils/ai-suggestions";

export async function POST(req: NextRequest) {
  try {
    const { context, knowledgeBaseId } = await req.json();

    let contextToAnalyze = context;

    // If no explicit context, try to get knowledge base instruction
    if (!contextToAnalyze && knowledgeBaseId) {
      try {
        const [knowledgeBase] = await db
          .select({ instruction: knowledgeBases.instruction })
          .from(knowledgeBases)
          .where(eq(knowledgeBases.id, knowledgeBaseId));
        
        if (knowledgeBase?.instruction) {
          contextToAnalyze = `Knowledge Base Instruction/Description:\n${knowledgeBase.instruction}`;
        }
      } catch (dbError) {
        console.error("Error fetching knowledge base instruction:", dbError);
      }
    }

    if (!contextToAnalyze) {
      contextToAnalyze = "General helpful AI assistant ready to answer questions and assist with tasks.";
    }

    const questions = await generateSuggestions(typeof contextToAnalyze === 'string' ? contextToAnalyze : JSON.stringify(contextToAnalyze));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ questions: [] }, { status: 500 });
  }
}
