"use client";

import { useEffect, useState } from "react";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "./tool";
import { type ToolUIPart } from "ai";
import { MessageResponse } from "./message";

interface ToolRowProps {
  part: ToolUIPart;
  toolName?: string;
  defaultOpen?: boolean;
}

export function ToolRow({
  part,
  toolName = "Tool",
  defaultOpen = true,
}: ToolRowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open when output becomes available, if desired
  useEffect(() => {
    if (part.state === "output-available" || part.state === "output-error") {
      setIsOpen(true);
    }
  }, [part.state]);

  const output = (part as any).output;
  let answer = "";
  if (typeof output === "string") {
    answer = output;
  } else if (output && typeof output === "object") {
    if (output.answer) {
      answer = output.answer;
    } else if (output.title) {
      answer = `Read content from: ${output.title}`;
    } else if (output.content) {
      answer = "Content read successfully.";
    }
  }

  return (
    <Tool open={isOpen} onOpenChange={setIsOpen}>
      <ToolHeader type={part.type} state={part.state} title={toolName} />
      <ToolContent>
        <ToolInput input={(part as any).args || (part as any).input} />
        <ToolOutput
          output={<MessageResponse>{answer}</MessageResponse>}
          errorText={(part as any).error}
        />
      </ToolContent>
    </Tool>
  );
}
