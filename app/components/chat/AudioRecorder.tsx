"use client";

import { Button } from "@/components/ui/button";
import { MdMic } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTranslations } from "next-intl";
import { FaCheck } from "react-icons/fa6";
import { useEffect, useRef } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onTranscriptionUpdate?: (text: string) => void;
  onTranscribingStateChange?: (isTranscribing: boolean) => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onTranscriptionComplete,
  onTranscriptionUpdate,
  onTranscribingStateChange,
  disabled = false,
}: AudioRecorderProps) {
  const t = useTranslations("chat");
  // Add a ref to track if recording was manually stopped or cancelled
  const isStoppedManuallyRef = useRef(false);

  const {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder({
    onTranscriptionComplete: (text) => {
      toast.dismiss();
      onTranscriptionComplete(text);

      // Pass transcription state to parent components
      if (onTranscribingStateChange) {
        onTranscribingStateChange(false);
      }
    },
    onTranscriptionUpdate: (text) => {
      // Only update transcription if not manually stopped/cancelled
      if (onTranscriptionUpdate && !isStoppedManuallyRef.current) {
        onTranscriptionUpdate(text);
      }
    },
    onRecordingStopped: () => {
      // Dismiss the recording toast when recording stops
      toast.dismiss();
      toast.loading(t("transcribing"));

      // Notify parent that transcribing has started
      if (onTranscribingStateChange) {
        onTranscribingStateChange(true);
      }
    },
    maxRecordingTime: 30000, // 30 seconds maximum recording time
    language: "en", // Default to Thai language
  });

  // Notify parent about transcribing state changes
  useEffect(() => {
    if (onTranscribingStateChange) {
      onTranscribingStateChange(isTranscribing);
    }
  }, [isTranscribing, onTranscribingStateChange]);

  const handleMicClick = async () => {
    try {
      if (isRecording) {
        // Set the flag to indicate manual stopping
        isStoppedManuallyRef.current = true;

        stopRecording();
        toast.loading(t("transcribing"));

        // Clear the real-time transcription in ChatForm
        if (onTranscriptionUpdate) {
          onTranscriptionUpdate("");
        }
      } else {
        // Reset the flag when starting a new recording
        isStoppedManuallyRef.current = false;

        toast.loading(t("recording"));
        await startRecording();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error recording audio"
      );
    }
  };

  const handleCancelClick = () => {
    try {
      // Set the flag to indicate manual cancellation
      isStoppedManuallyRef.current = true;

      cancelRecording();
      toast.dismiss();
      toast.info(t("recordingCancelled") || "Recording cancelled");

      // Clear the real-time transcription in ChatForm
      if (onTranscriptionUpdate) {
        onTranscriptionUpdate("");
      }
      if (onTranscribingStateChange) {
        onTranscribingStateChange(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error cancelling recording"
      );
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {isRecording && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="destructive"
                onClick={handleCancelClick}
                className="h-10 w-10 rounded-full"
                aria-label={t("cancelRecording") || "Cancel recording"}
              >
                <MdCancel />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("cancelRecording")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              onClick={handleMicClick}
              disabled={disabled}
              className={`h-10 w-10 rounded-full border bg-background text-foreground border-border ${
                isRecording ? "animate-pulse border-red-500" : ""
              }`}
              aria-label={
                isRecording ? t("stopRecording") : t("startRecording")
              }
            >
              {isRecording ? <FaCheck /> : <MdMic />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? t("stopRecording") : t("startRecording")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
