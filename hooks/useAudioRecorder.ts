import { useState, useRef, useEffect } from "react";

interface UseAudioRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
  onRecordingStopped?: () => void; // Add callback for when recording stops
  silenceTimeout?: number;
  silenceThreshold?: number;
  maxRecordingTime?: number; // Maximum recording time in milliseconds
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  silenceDetectionActive: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
}

export const useAudioRecorder = ({
  onTranscriptionComplete,
  onRecordingStopped,
  silenceTimeout = 3000,
  silenceThreshold = 5, // Lower threshold for better silence detection (0-255)
  maxRecordingTime = 10000, // Default maximum recording time: 10 seconds
}: UseAudioRecorderProps = {}): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [silenceDetectionActive, setSilenceDetectionActive] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  // Use refs for values that don't need to trigger re-renders
  const audioChunks = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
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

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Function to detect silence using audio analysis
  const detectSilence = () => {
    // console.log("Silence detection check:", {
    //   analyser: !!analyserRef.current,
    //   isRecording, // React state (may be delayed)
    //   isRecordingRef: isRecordingRef.current, // Ref value (immediate)
    // });

    // Only proceed if we have both an analyser and we're recording
    if (!analyserRef.current) {
      // console.log("No analyser available, skipping silence detection");
      return;
    }

    // Use the ref value instead of the state
    if (!isRecordingRef.current) {
      // console.log("Not recording (ref), skipping silence detection");
      return;
    }

    // console.log("Detecting silence...");
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume level
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    // console.log(`Average volume level: ${average}`);
    // If sound level is below threshold, start silence timer
    if (average < silenceThreshold) {
      if (!silenceTimerRef.current) {
        // console.log(
        //   `Sound level (${average}) below threshold (${silenceThreshold}), starting silence timer`
        // );
        silenceTimerRef.current = setTimeout(() => {
          // console.log(
          //   "Silence detected for timeout period, stopping recording"
          // );
          // console.log("isRecording state:", isRecording);
          // console.log("isRecordingRef.current:", isRecordingRef.current);
          // Use the ref value instead of the state for immediate access
          if (isRecordingRef.current) {
            stopRecording();
          }
        }, silenceTimeout);
      }
    } else {
      // If sound detected, clear silence timer
      if (silenceTimerRef.current) {
        // console.log(
        //   `Sound level (${average}) above threshold, resetting silence timer`
        // );
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    // Continue monitoring sound levels
    if (isRecordingRef.current) {
      // console.log("Continuing silence detection...");
      animationFrameRef.current = requestAnimationFrame(detectSilence);
      // console.log("Animation frame requested:", animationFrameRef.current);
    } else {
      // console.log(
      //   "Not continuing silence detection - isRecordingRef.current is false"
      // );
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

      // Set up audio context and analyzer for silence detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Small FFT size for better performance
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Try to use a format that's well-supported by both browsers and Whisper API
      // Whisper supports: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
      let mimeType = "audio/webm";

      // Check if the browser supports different audio formats in order of preference
      // Prioritize mp3 as it's most widely supported by Whisper API
      const supportedMimeTypes = [
        "audio/mpeg", // mp3
        "audio/mp3",
        "audio/wav",
        "audio/webm",
        "audio/ogg",
      ];

      for (const type of supportedMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      // console.log(`Selected MIME type for recording: ${mimeType}`);

      // Create and configure media recorder
      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);
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

          // console.log(
          //   `Created audio blob with MIME type: ${mimeType}, size: ${audioBlob.size} bytes`
          // );

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
      // console.log("Started recording");

      // Update both the React state (for UI) and the ref (for immediate access)
      setIsRecording(true);
      isRecordingRef.current = true;

      // Delay silence detection by 2 seconds to give the user time to start speaking
      // console.log("Will start silence detection in 2 seconds...");

      setTimeout(() => {
        // console.log("Starting silence detection now");
        if (isRecordingRef.current) {
          // Only start if still recording
          setSilenceDetectionActive(true); // Update UI state to show silence detection is active
          animationFrameRef.current = requestAnimationFrame(detectSilence);
        }
      }, 1000); // 1 second delay

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
    // console.log("Stop recording called, current state:", {
    //   mediaRecorderState: mediaRecorderRef.current?.state,
    //   isRecording,
    //   isRecordingRef: isRecordingRef.current,
    // });

    // Update both the React state (for UI) and the ref (for immediate access)
    setIsRecording(false);
    isRecordingRef.current = false;
    setSilenceDetectionActive(false); // Reset silence detection UI state

    // Call the onRecordingStopped callback if provided
    if (onRecordingStopped) {
      // console.log("Calling onRecordingStopped callback");
      onRecordingStopped();
    }

    // Only clean up silence detection resources, but keep mediaRecorder for transcription
    if (silenceTimerRef.current) {
      // console.log("Clearing silence timer");
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      // console.log("Cancelling animation frame");
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      // console.log("MediaRecorder ref:", mediaRecorderRef.current);
    }

    // Stop the mediaRecorder last, which will trigger the onstop event and transcription
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      // console.log("Stopping recording manually");
      mediaRecorderRef.current.stop();
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
    silenceDetectionActive,
    startRecording,
    stopRecording,
    transcribeAudio,
  };
};
