import { NextRequest, NextResponse } from "next/server";
import { playAudio } from "openai/helpers/audio";

import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const {
      text,
      voice = "sage",
      model = "gpt-4o-mini-tts",
    } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // console.log(`Generating speech for text: "${text.substring(0, 50)}..."`);
    // console.log(`Using voice: ${voice}, model: ${model}, streaming: ${streaming}`);

    // Use wav format for streaming for faster response times
    const responseFormat = "wav";

    const response = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: responseFormat,
      speed: 1.2,
      instructions:
        "You are a young Thai woman. Speak in a sweet, soft, and pleasant voice. Your tone should be natural, polite, and feminine, using 'ค่ะ' as polite ending. Respond in a consultative way: explain things clearly, give thoughtful suggestions, and maintain a caring, professional attitude like a friendly advisor.",
    });

    await playAudio(response);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: `Failed to generate speech: ${error}` },
      { status: 500 }
    );
  }
}
