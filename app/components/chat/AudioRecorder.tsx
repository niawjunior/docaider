"use client";

import { Button } from "@/components/ui/button";
import { MdMic } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTranslations } from "next-intl";
import { FaCheck } from "react-icons/fa6";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onTranscriptionComplete,
  disabled = false,
}: AudioRecorderProps) {
  const t = useTranslations("chat");
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
      {isRecording && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="destructive"
                onClick={handleCancelClick}
                disabled={isTranscribing}
                className="h-10 w-10 rounded-full "
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
              disabled={disabled || isTranscribing}
              className="h-10 w-10 rounded-full border bg-background text-foreground border-border "
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
