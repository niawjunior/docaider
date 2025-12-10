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

    // Helper to extract text from potential objects (RichTextFieldSchema)
    const getText = (val: any): string => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return val.content || "";
    }

    // Helper to extract specific context for the item being edited
    const getSpecificContext = (path: string | null): string => {
        if (!path || !resumeData) return "";
        
        // Match education[index].fieldOfStudy
        const eduMatch = path.match(/education\[(\d+)\]\./);
        if (eduMatch && resumeData.education) {
            const index = parseInt(eduMatch[1]);
            const item = resumeData.education[index];
            if (item) {
                const degree = getText(item.degree);
                const school = getText(item.institution);
                return `Specific Context for this item:\nInstitution: ${school}\nDegree: ${degree}`;
            }
        }

        // Match experience[index].position
        const expMatch = path.match(/experience\[(\d+)\]\./);
        if (expMatch && resumeData.experience) {
            const index = parseInt(expMatch[1]);
            const item = resumeData.experience[index];
            if (item) {
                const company = getText(item.company);
                return `Specific Context for this item:\nCompany: ${company}`;
            }
        }
        
        return "";
    };

    const specificContext = getSpecificContext(fieldContext);
    // Global Context - simplified to raw JSON as per user request
    const contextStr = JSON.stringify(resumeData, null, 2);

    // Schema for a single option (robustly unwrapped)
    const getSingleOptionSchema = (field: string | null) => {
        const lower = (field || "").toLowerCase();
        let baseSchema = z.string();

        if (lower.includes("phone")) baseSchema = z.string().describe("Phone number only.");
        else if (lower.includes("email")) baseSchema = z.string().describe("Email address only.");
        else if (lower.includes("website") || lower.includes("url")) baseSchema = z.string().describe("URL only.");
        else if (lower.includes("location")) baseSchema = z.string().describe("City, Country.");
        else if (lower.includes("company")) baseSchema = z.string().describe("Company Name only.");
        else if (lower.includes("institution")) baseSchema = z.string().describe("Institution Name only.");
        else if (lower.includes("position")) baseSchema = z.string().describe("Job Title only.");
        else if (lower.includes("degree")) baseSchema = z.string().describe("Degree Name only.");
        else if (lower.includes("fieldofstudy")) baseSchema = z.string().describe("Major/Field of Study only.");
        else if (lower.includes("date")) baseSchema = z.string().describe("Date in YYYY-MM format.");
        else baseSchema = z.string().describe("Professional resume content.");

        // Robust recursive unwrapper
        return z.union([
            baseSchema,
            z.record(z.any()).transform(val => {
                const findString = (obj: any): string => {
                    if (typeof obj === 'string') return obj;
                    if (typeof obj === 'object' && obj !== null) {
                        for (const key of Object.keys(obj)) {
                            const found = findString(obj[key]);
                            if (found) return found;
                        }
                    }
                    return "";
                }
                return findString(val);
            })
        ]);
    };

    const singleOptionSchema = getSingleOptionSchema(fieldContext);

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        option1: singleOptionSchema.describe("First variation."),
        option2: singleOptionSchema.describe("Second variation (different style/length)."),
        option3: singleOptionSchema.describe("Third variation (different style/length)."),
      }),
      prompt: `
        You are an expert professional resume editor.
        ${fieldContext ? `You are currently writing for the field at path: "${fieldContext}".` : ""}
        ${text ? "Your task is to improve the following text based on the user's instruction." : "Your task is to write new professional content based on the user's instruction."}
        
        RESUME DATA (JSON):
        ${contextStr}

        ${specificContext ? `\n${specificContext}` : ""}

        ${text ? `Original Text (Current Value):
        "${text}"` : ""}

        User Instruction:
        "${instruction || (text ? "Improve grammar, clarity, and professionalism." : `Write professional content for ${fieldContext || "a resume"}.`)}"

        Requirements:
        1. Analyze the full JSON context to understand the candidate's profile.
        2. Generate **3 DISTINCT variations** of the content for 'option1', 'option2', and 'option3'.
           - For standard text fields (Summary, Description, Objective): Generate one concise (option1), one detailed (option2), one action-oriented (option3). These MUST be complete sentences or paragraphs.
           - For short fields (Job Title, Position, Role, Degree, Field of Study, Label): Generate 3 distinct professional TITLE variations (e.g. "Software Engineer", "Senior Developer", "Full Stack Engineer"). ALL options must be titles only.
        3. Use professional language suitable for a resume.
        4. Do not add conversational filler.
        5. **CRITICAL**: Return ACTUAL content. Do NOT return placeholders like "string", "text", or "content".
        6. **CRITICAL FOR 'Job Title', 'Position', 'Degree', 'Field of Study'**: Return ONLY the name/title. Do NOT write a sentence.
        7. **CRITICAL FOR 'Summary', 'Description', 'Objective'**: Return FULL SENTENCES or PARAGRAPHS. Do NOT return a single job title.
        8. SPECIAL RULE FOR 'Field of Study': If the Degree context already mentions the subject (e.g. 'Bachelor of Computer Science'), extract ONLY the subject ('Computer Science').
      `,
    });

    // Valid raw options
    const rawOptions = [object.option1, object.option2, object.option3];

    // Safe post-processing: Filter out known hallucinations
    const cleanOptions = rawOptions
        .map(opt => typeof opt === 'string' ? opt.trim() : "") // Ensure string
        .filter(opt => {
            if (!opt) return false;
            const lower = opt.toLowerCase();
            return lower !== "string" && 
                   lower !== "text" && 
                   lower !== "content" && 
                   lower !== "answer" && 
                   lower !== "output" &&
                   lower.length > 1; // Allow 2-letter acronyms like "QA", "AI", "HR"
        });

    // Fallback if AI fails completely
    if (cleanOptions.length === 0) {
        if (text) {
             cleanOptions.push(text);
        } else {
             // Last resort fallback
             cleanOptions.push("Could not generate suggestions. Please ensure your resume has enough data.");
        }
    }

    return NextResponse.json({ options: cleanOptions });
  } catch (error) {
    console.error("Error improving text:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
