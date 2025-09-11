// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // ensure Node runtime (not edge)

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await req.formData();
    const audio = formData.get("audio");
    // Get language from form data or default to "th"
    const language = formData.get("language")?.toString() || "th";

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error: "Audio file is required (multipart/form-data, field 'audio')",
        },
        { status: 400 }
      );
    }

    // Ensure filename & extension are present
    const filename =
      audio.name && audio.name.includes(".") ? audio.name : "audio.webm";

    // Pass the original File/Blob directly to the SDK
    const transcription = await openai.audio.transcriptions.create({
      file: new File([await audio.arrayBuffer()], filename, {
        type: audio.type || "audio/webm", // Use the original type if available
      }),
      model: "gpt-4o-mini-transcribe",
      language: language,
      response_format: "text",
      stream: true,
      prompt: `You are a ${
        language === "th" ? "Thai" : "English"
      } assistant. Transcribe the audio to ${
        language === "th" ? "Thai" : "English"
      } text. Only output the transcribed text, no additional explanation.`,
    });
    // Create a readable stream to send the transcription chunks to the client
    const readable = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            for await (const chunk of transcription) {
              // Format the chunk for SSE
              const formattedChunk = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(new TextEncoder().encode(formattedChunk));

              // For final chunks, send a special message
              if (chunk.type === "transcript.text.done") {
                const finalMessage = `data: ${JSON.stringify({
                  type: "final",
                  text: chunk.text,
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(finalMessage));
              }
            }
          } catch (error) {
            console.error("Error processing transcription stream:", error);
            const errorMessage = `data: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorMessage));
          } finally {
            controller.close();
          }
        })();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Prevents Nginx from buffering the response
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
