import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { ResumeSchema } from "@/lib/schemas/resume";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.type === "application/pdf") {
      const data = await pdf(buffer);
      text = data.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.type === "text/plain" || file.type === "text/markdown") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    console.log(text);
    // Use AI to extract structured data
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ResumeSchema,
      prompt: `
            Extract structured resume data from the text below.
            
            IMPORTANT RULES:
            1. "customSections": This MUST be an array of OBJECTS. e.g. [{ "id": "cs-1", "title": "Volunteering", "type": "list", "items": [...] }].
               - Do NOT put strings (like "volunteering") in this array.
               - Strings belong in "sectionOrder".
            
            2. "sectionOrder": This MUST be an array of STRINGS representing the keys of sections.
               - e.g. ["personalInfo", "experience", "education", "customSections"]
            
            3. Fallbacks:
               - If the text is empty or unparsable, return a valid empty object with defaults (e.g. empty arrays for experience/education).
               - Do not fail. Return the best partial data possible.

            4. IDs:
               - Generate unique IDs (e.g. "exp-1", "edu-1") for all array items if missing.

            5. Skills:
               - Extract skills as a FLAT array of strings.
               - Split categories into individual skills.
               - Remove prefixes like "Frontend:", "Languages:", "Tools:", etc.
               - BAD: ["Frontend: React, Vue", "Backend: Node"]
               - GOOD: ["React", "Vue", "Node"]

            6. Summary & Header Summary:
               - These are OBJECTS with "content" and "alignment".
               - Extract the resume's "Summary", "Profile", or "Objective" section text into "personalInfo.summary.content".
               - CRITICAL: Also populate "personalInfo.headerSummary.content" with the SAME text.
               - Default "alignment" to "left" for both.
               - Do NOT return a simple string for either.

            TEXT TO PARSE:
            ${text}
            `,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
