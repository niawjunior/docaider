# Text-to-Speech Streaming Implementation

This document describes the streaming text-to-speech (TTS) implementation in Docaider.

## Overview

The text-to-speech feature allows the application to convert AI responses to spoken audio. The implementation uses OpenAI's GPT-4o-mini-tts model and supports streaming audio for faster response times and better user experience.

## Backend Implementation

The backend API is implemented in `/app/api/text-to-speech/route.ts` and provides two modes of operation:

### Streaming Mode

When `streaming: true` is passed in the request body:

1. Creates a `ReadableStream` to stream audio data to the client
2. Fetches the complete audio from OpenAI's API using the WAV format
3. Chunks the audio data (64KB chunks) and streams it to the client with small delays
4. Sets appropriate headers for streaming: `Content-Type: audio/wav`, `Cache-Control: no-cache`, and `Connection: keep-alive`

```typescript
// Example of streaming implementation
const readable = new ReadableStream({
  async start(controller) {
    try {
      // Get audio from OpenAI
      const response = await openai.audio.speech.create({
        model: model,
        voice: voice,
        input: text,
        response_format: "wav",
        instructions: "Speak in a natural and engaging tone.",
      });
      
      // Stream the audio data in chunks
      const audioData = await response.arrayBuffer();
      const data = new Uint8Array(audioData);
      
      // Set chunk size (64KB)
      const CHUNK_SIZE = 64 * 1024;
      let offset = 0;
      
      while (offset < data.length) {
        const chunk = data.slice(offset, offset + CHUNK_SIZE);
        controller.enqueue(chunk);
        offset += CHUNK_SIZE;
        
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    } catch (error) {
      controller.error(error);
    } finally {
      controller.close();
    }
  },
});
```

### Non-Streaming Mode

When `streaming: false` or not specified:

1. Fetches the complete audio from OpenAI's API using the MP3 format
2. Returns the full audio buffer in the response

## Frontend Implementation

The frontend implementation is in `/app/components/ChatForm.tsx` and handles both streaming and non-streaming audio playback:

1. Sends a request to the text-to-speech API with the text to convert
2. Reads the response stream using `response.body?.getReader()`
3. Collects all chunks of audio data
4. Combines the chunks into a single array
5. Decodes the audio data using Web Audio API
6. Creates an audio source node and plays the audio
7. Handles completion by setting `isSpeaking` state to false

```typescript
// Example of frontend streaming implementation
const handleTextToSpeech = async (text: string) => {
  // Initialize Web Audio API
  const audioContext = new (window.AudioContext || webkitAudioContext)();
  
  // Fetch streaming audio
  const response = await fetch("/api/text-to-speech", {
    method: "POST",
    body: JSON.stringify({
      text,
      voice: "coral",
      model: "gpt-4o-mini-tts",
      streaming: true,
    }),
  });
  
  // Read and process the stream
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine chunks and play audio
  // ...
}
```

## User Experience

- The UI shows a "Speaking" toast notification when audio is playing
- The input field is disabled during speech playback to prevent conflicts
- Error handling provides user feedback via toast notifications
- Audio resources are properly cleaned up after playback

## Configuration Options

- **Voice**: Currently set to "coral" (can be changed to other available OpenAI voices)
- **Model**: Using "gpt-4o-mini-tts" for optimal quality and speed
- **Streaming**: Boolean flag to enable/disable streaming mode

## Future Improvements

- Add progress indicator during audio playback
- Allow interruption of speech playback
- Support for voice selection in the UI
- Optimize chunk size and delay for different network conditions
