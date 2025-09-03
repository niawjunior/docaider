import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Log the file type for debugging
    console.log("Audio file type:", audioFile.type);
    console.log("Audio file name:", audioFile.name);

    // Get the file extension from the MIME type
    let fileExtension = audioFile.type.split("/")[1] || "webm";

    // Ensure we're using a supported extension for OpenAI Whisper
    // Supported formats: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
    const supportedExtensions = [
      "flac",
      "m4a",
      "mp3",
      "mp4",
      "mpeg",
      "mpga",
      "oga",
      "ogg",
      "wav",
      "webm",
    ];

    // Map MIME subtypes to supported extensions
    const mimeToExtension: Record<string, string> = {
      webm: "webm",
      ogg: "ogg",
      mpeg: "mp3",
      mp4: "mp4",
      "x-m4a": "m4a",
      wav: "wav",
      "x-wav": "wav",
      flac: "flac",
    };

    // Use the mapped extension if available
    if (mimeToExtension[fileExtension]) {
      fileExtension = mimeToExtension[fileExtension];
    } else if (!supportedExtensions.includes(fileExtension)) {
      // Default to mp3 if not supported (more widely supported than webm)
      fileExtension = "mp3";
    }

    // Force the file extension to be mp3 for maximum compatibility with OpenAI Whisper
    fileExtension = "mp3";

    console.log(
      `Processing audio file with type: ${audioFile.type}, using extension: ${fileExtension}`
    );

    // Convert the audio file to a format OpenAI can use
    const audioBytes = await audioFile.arrayBuffer();

    // Create a file-like object that OpenAI's SDK can use
    // Make sure the filename has the correct extension that matches the actual format
    const file = new File([audioBytes], `audio.${fileExtension}`, {
      type: audioFile.type,
    });

    // Use the OpenAI SDK to transcribe the audio
    // According to the docs, whisper-1 supports: mp3, mp4, mpeg, mpga, m4a, wav, and webm
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "json",
    });

    console.log("Transcription result:", transcription);

    return NextResponse.json({
      text: transcription.text,
      success: true,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: String(error) },
      { status: 500 }
    );
  }
}
