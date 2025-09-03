import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const {
      text,
      voice = "coral",
      model = "gpt-4o-mini-tts",
      streaming = false,
    } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // console.log(`Generating speech for text: "${text.substring(0, 50)}..."`);
    // console.log(`Using voice: ${voice}, model: ${model}, streaming: ${streaming}`);

    // Use wav format for streaming for faster response times
    const responseFormat = streaming ? "wav" : "mp3";

    if (streaming) {
      // Create a ReadableStream for streaming the audio data
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Start the streaming process
            const response = await openai.audio.speech.create({
              model: model,
              voice: voice,
              input: text,
              response_format: responseFormat,
              speed: 1.2,
              instructions:
                "You are a young Thai woman. Speak in a sweet, soft, and pleasant voice. Your tone should be natural, polite, and feminine, using 'ค่ะ' as polite ending. Respond in a consultative way: explain things clearly, give thoughtful suggestions, and maintain a caring, professional attitude like a friendly advisor.",
            });

            // Get the audio data as an ArrayBuffer
            const audioData = await response.arrayBuffer();
            const data = new Uint8Array(audioData);

            // Set chunk size (64KB)
            const CHUNK_SIZE = 64 * 1024;
            let offset = 0;

            // Stream the audio data in chunks
            while (offset < data.length) {
              const chunk = data.slice(offset, offset + CHUNK_SIZE);
              controller.enqueue(chunk);
              offset += CHUNK_SIZE;

              // Add small delay to prevent overwhelming the client
              await new Promise((resolve) => setTimeout(resolve, 20));
            }
          } catch (error) {
            console.error("Error during streaming:", error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      // Return the readable stream as the response
      return new Response(readable, {
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming approach (original implementation)
      const audioResponse = await openai.audio.speech.create({
        model: model,
        voice: voice,
        input: text,
        response_format: responseFormat,
        instructions:
          "You are a Thai girl. Speak in a sweet and pleasant tone, soft and polite. Use natural feminine Thai expressions and polite ending particles such as 'ค่ะ'.",
      });

      // Get the audio data as an ArrayBuffer
      const audioData = await audioResponse.arrayBuffer();

      // Return the audio data with the appropriate content type
      return new NextResponse(audioData, {
        headers: {
          "Content-Type": streaming ? "audio/wav" : "audio/mpeg",
          "Content-Length": audioData.byteLength.toString(),
        },
      });
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: `Failed to generate speech: ${error}` },
      { status: 500 }
    );
  }
}
