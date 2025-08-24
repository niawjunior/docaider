"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FaArrowUp } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
  status: string;
  isShowTool: boolean | undefined;
  isRequiredDocument: boolean;
  setIsRequiredDocument: (value: boolean) => void;
  error?: string;
}

export default function ChatInput({
  input,
  setInput,
  handleSubmit,
  status,
  isShowTool,
  isRequiredDocument,
  setIsRequiredDocument,
}: ChatInputProps) {
  const t = useTranslations("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center flex-col gap-3 w-full relative">
        <Textarea
          value={input}
          ref={textareaRef}
          onChange={handleInputChange}
          placeholder={status !== "ready" ? t("thinking") : t("askAnything")}
          disabled={status !== "ready"}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-card max-h-[80px] text-card-foreground px-4 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 overflow-y-auto scroll-hidden"
        />

        <Button
          onClick={handleSubmit}
          variant="outline"
          disabled={status !== "ready" || !input.trim()}
          className="h-10 w-10 rounded-full border bg-background text-foreground border-border absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <FaArrowUp />
        </Button>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-muted-foreground text-sm">{t("disclaimer")}</div>

        {!isShowTool && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRequiredDocument}
              onCheckedChange={setIsRequiredDocument}
            />
            <Label htmlFor="document-search">{t("alwaysSearchDocument")}</Label>
          </div>
        )}
      </div>
    </div>
  );
}
