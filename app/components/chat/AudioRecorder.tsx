"use client";

import { Button } from "@/components/ui/button";
import { MdMic, MdMicOff } from "react-icons/md";
import { MdCancel } from "react-icons/md";
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
  const { isRecording, isTranscribing, startRecording, stopRecording, cancelRecording } =
    useAudioRecorder({
      onTranscriptionComplete: (text) => {
        toast.dismiss();
        onTranscriptionComplete(text);
      },
      onRecordingStopped: () => {
        // Dismiss the recording toast when recording stops
        toast.dismiss();
        toast.loading(t("transcribing"));
      },
      maxRecordingTime: 10000, // 10 seconds maximum recording time
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

  const handleCancelClick = () => {
    try {
      cancelRecording();
      toast.dismiss();
      toast.info(t("recordingCancelled") || "Recording cancelled");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error cancelling recording"
      );
    }
  };

  return (
    <div className="relative flex items-center gap-2">
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
      
      {isRecording && (
        <Button
          variant="outline"
          onClick={handleCancelClick}
          disabled={isTranscribing}
          className="h-10 w-10 rounded-full border bg-background text-foreground border-border hover:bg-red-100"
          title={t("cancelRecording") || "Cancel recording"}
          aria-label={t("cancelRecording") || "Cancel recording"}
        >
          <MdCancel className="text-red-500" />
        </Button>
      )}
    </div>
  );
}
