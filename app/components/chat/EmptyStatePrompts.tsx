"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface EmptyStatePromptsProps {
  suggestedPrompts?: { title: string; subtitle?: string }[];
  onPromptClick: (text: string) => void;
}

export default function EmptyStatePrompts({
  suggestedPrompts,
  onPromptClick,
}: EmptyStatePromptsProps) {
  const t = useTranslations("chat");

  return (
    <>
      <div className="md:mt-0 mt-[100px]">
        <p className="text-2xl font-bold">{t("greeting")}</p>
        <p className="text-zinc-300">{t("helpPrompt")}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full md:max-h-[calc(100dvh-350px)] max-h-[calc(100dvh-550px)] overflow-y-auto scroll-hidden px-2">
        {suggestedPrompts?.map((prompt, idx) => (
          <Button
            variant="outline"
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              onPromptClick(`${prompt.title} ${prompt.subtitle || ""}`);
            }}
            className="flex flex-col justify-center items-center gap-2 h-[70px]"
          >
            <p className="text-sm font-semibold text-wrap">{prompt.title}</p>
            <p className="text-xs text-zinc-400 text-wrap">{prompt.subtitle}</p>
          </Button>
        ))}
      </div>
    </>
  );
}
