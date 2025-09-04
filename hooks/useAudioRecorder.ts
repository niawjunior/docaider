import { useState, useRef, useEffect } from "react";

interface UseAudioRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
  onRecordingStopped?: () => void; // Add callback for when recording stops
  maxRecordingTime?: number; // Maximum recording time in milliseconds
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
}

export const useAudioRecorder = ({
  onTranscriptionComplete,
  onRecordingStopped,
  maxRecordingTime = 10000, // Default maximum recording time: 10 seconds
}: UseAudioRecorderProps = {}): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Use refs for values that don't need to trigger re-renders
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const maxRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref to track recording state for immediate access in callbacks
  const isRecordingRef = useRef<boolean>(false);
  // Use a ref to maintain reference to mediaRecorder across async callbacks
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  // Function to clean up all resources
  const cleanupResources = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      // Clean up any existing resources first
      cleanupResources();

      // Reset audio chunks
      audioChunks.current = [];

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Try to use a format that's well-supported by both browsers and Whisper API
      // Whisper supports: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
      let mimeType = "audio/webm";
      // Create and configure media recorder
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder; // Store in ref for access in async callbacks

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          // Create a blob from the audio chunks
          const mimeType = recorder.mimeType || "audio/webm";

          // Ensure we're using a supported format
          const audioBlob = new Blob(audioChunks.current, {
            type: mimeType,
          });

          // Clean up resources
          cleanupResources();

          // Transcribe the audio
          await transcribeAudio(audioBlob);
        } catch (error) {
          console.error("Error in recorder.onstop:", error);
        }
      };

      // Start recording
      recorder.start(100); // Collect data every 100ms

      // Update both the React state (for UI) and the ref (for immediate access)
      setIsRecording(true);
      isRecordingRef.current = true;

      // Set up maximum recording time limit
      maxRecordingTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          stopRecording();
        }
      }, maxRecordingTime);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = (): void => {
    // Update both the React state (for UI) and the ref (for immediate access)
    setIsRecording(false);
    isRecordingRef.current = false;

    // Call the onRecordingStopped callback if provided
    if (onRecordingStopped) {
      onRecordingStopped();
    }

    // Stop the mediaRecorder, which will trigger the onstop event and transcription
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = (): void => {
    // Update both the React state (for UI) and the ref (for immediate access)
    setIsRecording(false);
    isRecordingRef.current = false;

    // Clean up resources without triggering transcription
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null;

      // Stop the recorder
      mediaRecorderRef.current.stop();

      // Reset the audio chunks
      audioChunks.current = [];
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      setIsTranscribing(true);

      // Always use mp3 extension for maximum compatibility with OpenAI Whisper
      // This doesn't change the actual audio format, just the filename extension
      const fileExtension = "mp3";

      // console.log(
      //   `Transcribing audio with type: ${audioBlob.type}, using extension: ${fileExtension}`
      // );

      const formData = new FormData();
      formData.append("audio", audioBlob, `recording.${fileExtension}`);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.text) {
        if (onTranscriptionComplete) {
          onTranscriptionComplete(data.text);
        }
        return data.text;
      } else {
        throw new Error(data.error || "Failed to transcribe audio");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error(
        `Error transcribing audio: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio,
  };
};
