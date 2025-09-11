"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FaArrowUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AudioRecorder from "./AudioRecorder";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
  status: string;
  isRequiredDocument: boolean;
  setIsRequiredDocument: (value: boolean) => void;
  isUseVoiceMode: boolean;
  setIsUseVoiceMode: (value: boolean) => void;
  isSpeaking?: boolean;
  error?: string;
  onTranscriptionUpdate?: (text: string) => void;
  onTranscribingStateChange?: (isTranscribing: boolean) => void;
}

export default function ChatInput({
  input,
  setInput,
  handleSubmit,
  status,
  isRequiredDocument,
  setIsRequiredDocument,
  isUseVoiceMode,
  setIsUseVoiceMode,
  isSpeaking = false,
  onTranscriptionUpdate,
  onTranscribingStateChange,
}: ChatInputProps) {
  const t = useTranslations("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Focus on load
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const active = document.activeElement;

      // If already typing in an input/textarea or using a shortcut, do nothing
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      // Ignore if non-character keys (e.g., Shift, Tab, etc.)
      if (e.key.length === 1) {
        textareaRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isDesktop) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleTranscriptionComplete = (text: string) => {
    setInput(text);
    // Clear the transcription display
    if (onTranscriptionUpdate) {
      onTranscriptionUpdate("");
    }
    if (onTranscribingStateChange) {
      onTranscribingStateChange(false);
    }
    // focus on textarea after transcription
    textareaRef.current?.focus();
    setTimeout(() => {
      buttonRef.current?.click();
    }, 100);
  };

  const handleTranscriptionUpdate = (text: string) => {
    if (onTranscriptionUpdate) {
      onTranscriptionUpdate(text);
    }
  };

  const handleTranscribingStateChange = (isTranscribing: boolean) => {
    if (onTranscribingStateChange) {
      onTranscribingStateChange(isTranscribing);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center flex-col gap-3 w-full relative">
        <div className="relative w-full">
          <Textarea
            value={input}
            ref={textareaRef}
            onChange={handleInputChange}
            placeholder={
              status !== "ready"
                ? t("thinking")
                : isSpeaking
                ? t("speaking")
                : t("askAnything")
            }
            disabled={status !== "ready" || isSpeaking}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-card max-h-[80px] text-card-foreground px-4 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 overflow-y-auto scroll-hidden w-full"
          />
        </div>
        <div className="right-2 absolute flex gap-2 top-1/2 transform -translate-y-1/2">
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            onTranscriptionUpdate={handleTranscriptionUpdate}
            onTranscribingStateChange={handleTranscribingStateChange}
            disabled={status !== "ready" || isSpeaking}
          />

          <Button
            ref={buttonRef}
            onClick={handleSubmit}
            variant="outline"
            disabled={status !== "ready" || !input.trim() || isSpeaking}
            className="h-10 w-10 rounded-full border bg-background text-foreground border-border  "
          >
            <FaArrowUp />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-muted-foreground text-xs">{t("disclaimer")}</div>

        <div className="flex  items-center space-x-2">
          <Switch
            id="use-voice-mode"
            checked={isUseVoiceMode}
            onCheckedChange={setIsUseVoiceMode}
          />
          <Label htmlFor="use-voice-mode" className="text-xs">
            {t("useVoiceMode")}
          </Label>

          <Switch
            checked={isRequiredDocument}
            onCheckedChange={setIsRequiredDocument}
          />
          <Label htmlFor="document-search" className="text-xs">
            {t("alwaysSearchDocument")}
          </Label>
        </div>
      </div>
    </div>
  );
}
