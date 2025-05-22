import React from "react";
import { Button } from "@/components/ui/button";

interface SuggestedPromptsProps {
  prompts: { title: string; subtitle: string }[];
  onPromptClick: (text: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  prompts,
  onPromptClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 sm:px-0">
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto whitespace-normal"
          onClick={() => onPromptClick(`${prompt.title} ${prompt.subtitle}`)}
        >
          <div className="text-sm font-semibold">{prompt.title}</div>
          <div className="text-xs text-gray-500">{prompt.subtitle}</div>
        </Button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
