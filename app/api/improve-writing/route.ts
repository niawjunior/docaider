import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, instruction, resumeData, fieldContext } = await req.json();

    if (!text && !instruction) {
      return NextResponse.json({ error: "No text or instruction provided" }, { status: 400 });
    }

    // Helper to format resume context
    const getContext = () => {
        if (!resumeData) return "";
        
        // Helper to extract text from potential objects (RichTextFieldSchema)
        const getText = (val: any): string => {
            if (!val) return "";
            if (typeof val === "string") return val;
            return val.content || "";
        }

        let ctx = "RESUME CONTEXT (Use this to write personalized content):\n";
        
        const r = resumeData;
        if (r.personalInfo) {
            ctx += `Name: ${r.personalInfo.fullName || "Unknown"}\n`;
            ctx += `Title: ${r.personalInfo.jobTitle || "Unknown"}\n`;
        }
        
        if (r.experience && Array.isArray(r.experience) && r.experience.length > 0) {
            ctx += "\nEXPERIENCE:\n";
            r.experience.slice(0, 3).forEach((exp: any) => {
                const position = getText(exp.position);
                const company = getText(exp.company);
                const start = getText(exp.startDate);
                const end = getText(exp.endDate) || "Present";
                
                ctx += `- ${position} at ${company} (${start} - ${end})\n`;
                const desc = getText(exp.description);
                if (desc) ctx += `  Desc: ${desc.substring(0, 100)}...\n`;
            });
        }
        
        if (r.education && Array.isArray(r.education) && r.education.length > 0) {
            ctx += "\nEDUCATION:\n";
            r.education.slice(0, 2).forEach((edu: any) => {
                const degree = getText(edu.degree);
                const institution = getText(edu.institution);
               ctx += `- ${degree} from ${institution}\n`;
            });
        }
        
        if (r.skills && Array.isArray(r.skills)) {
            const skillNames = r.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean).join(", ");
             if (skillNames) ctx += `\nSKILLS: ${skillNames}\n`;
        }
        
        return ctx;
    };

    const contextStr = getContext();

    // Dynamically define Zod schema based on field type
    const getFieldSchema = (field: string | null) => {
        const lower = (field || "").toLowerCase();
        
        if (lower.includes("phone")) return z.string().describe("Phone number only (e.g. +1-234-567-8900).");
        if (lower.includes("email")) return z.string().describe("Email address only.");
        if (lower.includes("website") || lower.includes("linkedin") || lower.includes("url")) return z.string().describe("URL only.");
        
        if (lower.includes("location")) return z.string().describe("City, Country (e.g. New York, NY). No sentences.");
        
        if (lower.includes("company")) return z.string().describe("Company Name only. No sentences.");
        if (lower.includes("institution") || lower.includes("university")) return z.string().describe("Institution Name only. No sentences.");
        
        if (lower.includes("position") || lower.includes("jobtitle")) return z.string().describe("Job Title only. No sentences.");
        
        if (lower.includes("degree")) return z.string().describe("Degree Name only (e.g. Bachelor of Science). No sentences.");
        if (lower.includes("fieldofstudy")) return z.string().describe("Major/Field of Study only (e.g. Computer Science). No sentences.");
        
        if (lower.includes("date")) return z.string().describe("Date in YYYY-MM format or 'Present'.");
        
        if (lower.includes("summary") || lower.includes("description")) return z.string().describe("Professional resume content. Clear, action-oriented, and concise.");
        
        return z.string().describe("Professional resume content.");
    };

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        improvedText: getFieldSchema(fieldContext),
      }),
      prompt: `
        You are an expert professional resume editor.
        ${fieldContext ? `You are currently writing for the field: "${fieldContext}".` : ""}
        ${text ? "Your task is to improve the following text based on the user's instruction." : "Your task is to write new professional content based on the user's instruction."}
        
        ${contextStr}

        ${text ? `Original Text:
        "${text}"` : ""}

        User Instruction:
        "${instruction || (text ? "Improve grammar, clarity, and professionalism." : `Write professional content for ${fieldContext || "a resume"}.`)}"

        Requirements:
        1. Use professional, action-oriented language suitable for a resume.
        2. Do not add conversational filler (e.g., "Here is the text"). Just return the text.
        3. ${text ? "Maintain the original meaning usually, unless told otherwise." : `Create high-quality content that fits the instruction and the provided Resume Context given that it is for ${fieldContext || "resumes"}.`}
        4. If writing a summary, use the Experience and Skills from the context to make it accurate.
      `,
    });

    return NextResponse.json({ improvedText: object.improvedText });
  } catch (error) {
    console.error("Error improving text:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
