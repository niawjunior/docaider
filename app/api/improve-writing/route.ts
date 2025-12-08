import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, instruction, resumeData } = await req.json();

    if (!text && !instruction) {
      return NextResponse.json({ error: "No text or instruction provided" }, { status: 400 });
    }

    // Helper to format resume context
    const getContext = () => {
        if (!resumeData) return "";
        let ctx = "RESUME CONTEXT (Use this to write personalized content):\n";
        
        const r = resumeData;
        if (r.personalInfo) {
            ctx += `Name: ${r.personalInfo.fullName || "Unknown"}\n`;
            ctx += `Title: ${r.personalInfo.jobTitle || "Unknown"}\n`;
        }
        
        if (r.experience && Array.isArray(r.experience) && r.experience.length > 0) {
            ctx += "\nEXPERIENCE:\n";
            r.experience.slice(0, 3).forEach((exp: any) => {
                ctx += `- ${exp.position} at ${exp.company} (${exp.startDate || ""} - ${exp.endDate || "Present"})\n`;
                if (exp.description) ctx += `  Desc: ${exp.description.substring(0, 100)}...\n`;
            });
        }
        
        if (r.education && Array.isArray(r.education) && r.education.length > 0) {
            ctx += "\nEDUCATION:\n";
            r.education.slice(0, 2).forEach((edu: any) => {
               ctx += `- ${edu.degree} from ${edu.institution}\n`;
            });
        }
        
        if (r.skills && Array.isArray(r.skills)) {
            const skillNames = r.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean).join(", ");
             if (skillNames) ctx += `\nSKILLS: ${skillNames}\n`;
        }
        
        return ctx;
    };

    const contextStr = getContext();

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        improvedText: z.string().describe("The improved or generated text"),
      }),
      prompt: `
        You are an expert professional resume editor.
        ${text ? "Your task is to improve the following text based on the user's instruction." : "Your task is to write new professional content based on the user's instruction."}
        
        ${contextStr}

        ${text ? `Original Text:
        "${text}"` : ""}

        User Instruction:
        "${instruction || (text ? "Improve grammar, clarity, and professionalism." : "Write professional content for a resume.")}"

        Requirements:
        1. Use professional, action-oriented language suitable for a resume.
        2. Do not add conversational filler (e.g., "Here is the text"). Just return the text.
        3. ${text ? "Maintain the original meaning usually, unless told otherwise." : "Create high-quality content that fits the instruction and the provided Resume Context."}
        4. If writing a summary, use the Experience and Skills from the context to make it accurate.
      `,
    });

    return NextResponse.json({ improvedText: object.improvedText });
  } catch (error) {
    console.error("Error improving text:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
