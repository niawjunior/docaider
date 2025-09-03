import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { text, voice = "coral", model = "tts-1" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log(`Generating speech for text: "${text.substring(0, 50)}..."`);
    console.log(`Using voice: ${voice}, model: ${model}`);

    const mp3Response = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: "mp3",
    });

    // Get the audio data as an ArrayBuffer
    const audioData = await mp3Response.arrayBuffer();

    // Return the audio data with the appropriate content type
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioData.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech", details: String(error) },
      { status: 500 }
    );
  }
}
