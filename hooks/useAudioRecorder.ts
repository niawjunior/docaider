import { debounce, pickMimeType } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface UseAudioRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
  onTranscriptionUpdate?: (text: string) => void;
  onRecordingStopped?: () => void;
  maxRecordingTime?: number; // ms
  language?: string;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  /** kept for external callers; internally we use transcribeBlob */
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
  currentTranscription: string;
}

export const useAudioRecorder = ({
  onTranscriptionComplete,
  onTranscriptionUpdate,
  onRecordingStopped,
  maxRecordingTime = 10000,
  language = "th",
}: UseAudioRecorderProps = {}): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");

  const debouncedSetCurrentTranscription = useRef(
    debounce((text: string) => setCurrentTranscription(text), 100)
  ).current;

  const latestTranscriptionRef = useRef("");

  // runtime refs
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const transcriptionTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // track concurrent streaming ops to avoid flicker
  const activeTranscriptionsRef = useRef(0);

  useEffect(() => {
    return () => {
      cleanupResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupResources = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch {}

    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

    if (transcriptionTimerRef.current) {
      clearInterval(transcriptionTimerRef.current);
      transcriptionTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      cleanupResources();

      audioChunks.current = [];
      setCurrentTranscription("");
      latestTranscriptionRef.current = "";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunks.current, {
            type: recorder.mimeType || mimeType,
          });

          // stop stream + timers now that we've ended
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          if (maxRecordingTimerRef.current) {
            clearTimeout(maxRecordingTimerRef.current);
            maxRecordingTimerRef.current = null;
          }
          if (transcriptionTimerRef.current) {
            clearInterval(transcriptionTimerRef.current);
            transcriptionTimerRef.current = null;
          }

          await transcribeBlob(blob, {
            filename: "recording.webm",
            preview: false,
          });
        } catch (err) {
          console.error("Error in recorder.onstop:", err);
          setIsTranscribing(false);
        }
      };

      recorder.start(500); // gather data every 500ms

      setIsRecording(true);
      isRecordingRef.current = true;

      maxRecordingTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current) stopRecording();
      }, maxRecordingTime);

      // light periodic streaming (approx every 0.8s)
      transcriptionTimerRef.current = setInterval(async () => {
        if (!isRecordingRef.current || audioChunks.current.length === 0) return;

        // snapshot current buffer for preview; do not clear source chunks
        const mime = mediaRecorderRef.current?.mimeType || "audio/webm";
        const previewBlob = new Blob([...audioChunks.current], { type: mime });

        // fire-and-forget; guard to avoid overlapping too much
        if (activeTranscriptionsRef.current === 0) {
          void transcribeBlob(previewBlob, {
            filename: "recording-chunk.webm",
            preview: true,
          });
        }
      }, 800);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = (): void => {
    setIsRecording(false);
    isRecordingRef.current = false;

    onRecordingStopped?.();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("stopRecording error:", e);
      }
    }
  };

  const cancelRecording = (): void => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setCurrentTranscription("");
    latestTranscriptionRef.current = "";
    audioChunks.current = [];

    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
    if (transcriptionTimerRef.current) {
      clearInterval(transcriptionTimerRef.current);
      transcriptionTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        // prevent onstop -> final transcription
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  /**
   * Unified transcription (used for both preview & final).
   * - preview=true: emits deltas, may emit final from backend but won’t call onTranscriptionComplete.
   * - preview=false: streams deltas and calls onTranscriptionComplete on final.
   */
  const transcribeBlob = async (
    audioBlob: Blob,
    opts: { filename: string; preview: boolean }
  ): Promise<string> => {
    let finalText = "";
    let streamingText = opts.preview ? latestTranscriptionRef.current : "";

    try {
      // track active ops to manage isTranscribing without flicker
      activeTranscriptionsRef.current += 1;
      setIsTranscribing(true);

      const formData = new FormData();
      formData.append("audio", audioBlob, opts.filename);
      formData.append("language", language);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Failed to transcribe audio";
        try {
          const err = await response.json();
          if (err?.error) message = err.error;
        } catch {}
        throw new Error(message);
      }
      if (!response.body) {
        throw new Error("No response body for streaming transcription");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "transcript.text.delta") {
              streamingText += data.delta;
              latestTranscriptionRef.current = streamingText;

              // debounced for UI smoothness
              debouncedSetCurrentTranscription(streamingText);
              onTranscriptionUpdate?.(streamingText);
            } else if (
              data.type === "final" ||
              data.type === "transcript.text.done"
            ) {
              finalText = String(data.text ?? "");
              latestTranscriptionRef.current = finalText;
              setCurrentTranscription(finalText);

              if (!opts.preview) {
                onTranscriptionComplete?.(finalText);
              } else {
                // for preview, treat as an update
                onTranscriptionUpdate?.(finalText);
              }
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        }
      }

      reader.releaseLock();
      return finalText || streamingText;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error(
        `Error transcribing audio: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      activeTranscriptionsRef.current = Math.max(
        0,
        activeTranscriptionsRef.current - 1
      );
      if (activeTranscriptionsRef.current === 0) {
        setIsTranscribing(false);
      }
    }
  };

  /** Back-compat: expose a single-call final transcription API */
  const transcribeAudio = (audioBlob: Blob) =>
    transcribeBlob(audioBlob, { filename: "recording.webm", preview: false });

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio,
    currentTranscription,
  };
};
