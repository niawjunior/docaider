"use client";

import { Button } from "@/components/ui/button";
import { MdMic, MdMicOff } from "react-icons/md";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTranslations } from "next-intl";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onTranscriptionComplete,
  disabled = false,
}: AudioRecorderProps) {
  const t = useTranslations("chat");
  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useAudioRecorder({
      onTranscriptionComplete: (text) => {
        toast.dismiss();
        onTranscriptionComplete(text);
      },
      onRecordingStopped: () => {
        // Dismiss the recording toast when recording stops via silence detection
        toast.dismiss();
        toast.loading(t("transcribing"));
      },
      silenceTimeout: 3000, // 3 seconds of silence
      silenceThreshold: 10, // Adjust this value based on testing (0-255)
    });

  const handleMicClick = async () => {
    try {
      if (isRecording) {
        stopRecording();
        toast.loading(t("transcribing"));
      } else {
        toast.loading(t("recording"));
        await startRecording();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error recording audio"
      );
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleMicClick}
        disabled={disabled || isTranscribing}
        className={`h-10 w-10 rounded-full border bg-background text-foreground border-border ${
          isRecording ? "bg-red-500 text-white" : ""
        } ${isTranscribing ? "opacity-50" : ""}`}
        title={isRecording ? t("stopRecording") : t("startRecording")}
        aria-label={isRecording ? t("stopRecording") : t("startRecording")}
      >
        {isRecording ? <MdMicOff /> : <MdMic />}
      </Button>
    </div>
  );
}
