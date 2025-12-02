"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import type { EmbedChatBoxRef } from "docaider-embed";

const EmbedChatBox = dynamic(
  () =>
    import("docaider-embed").then((mod) => ({
      default: mod.EmbedChatBox,
    })),
  {
    ssr: false
  }
);

interface EmbedChatBoxPreviewProps {
  knowledgeBaseId: string;
  src: string;
  chatId: string | null;
  chatboxTitle?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
  welcomeMessage?: string;
  placeholder?: string;
  isInitializing?: boolean;
  initError?: Error | null;
  theme?: "blue" | "gray" | "green";
}

export default function EmbedChatBoxPreview({
  knowledgeBaseId,
  src,
  chatId,
  chatboxTitle = "AI Assistant",
  position = "bottom-right",
  width = "350px",
  height = "500px",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder,
  isInitializing = false,
  initError = null,
  theme = "blue",
}: EmbedChatBoxPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const chatBoxRef = useRef<EmbedChatBoxRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full ">
      <div className="absolute px-2 left-4 top-8 z-10 flex flex-col gap-2">

        <div className="flex flex-col gap-2">
          <button
            onClick={() => chatBoxRef.current?.open()}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Open
          </button>
          <button
            onClick={() => chatBoxRef.current?.close()}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Close
          </button>
          <button
            onClick={() => chatBoxRef.current?.toggle()}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Toggle
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => chatBoxRef.current?.setWelcomeMessage("Hello from control!")}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Set Welcome
          </button>
          <button
            onClick={() => chatBoxRef.current?.setMessage("How do I use this?")}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Set Input
          </button>
          <button
            onClick={() => chatBoxRef.current?.sendMessage("Hello! This is a programmatic message.")}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Send Message
          </button>
          <button
            onClick={() => {
              // @ts-ignore
              chatBoxRef.current?.useTool("context", { prompt: "correct grammar", content: "I go to schol today" });
            }}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Tool: Context
          </button>
          <button
            onClick={() => {
              // @ts-ignore
              chatBoxRef.current?.useTool("readCurrentPage", { content: "What do you see on the page?"});
            }}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Tool: Read Page
          </button>
          <button
            onClick={() => {
              // @ts-ignore
              chatBoxRef.current?.useTool("knowledge-base", { content: "What is Docaider?" });
            }}
            className="px-3 py-1.5 bg-white border rounded-md text-xs hover:bg-gray-50 shadow-sm"
          >
            Tool: Ask Question
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-gray-200 m-4 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-sm">Your website content area</p>
      </div>

      <EmbedChatBox
        ref={chatBoxRef}
        knowledgeBaseId={knowledgeBaseId}
        src={src}
        chatId={chatId}
        chatboxTitle={chatboxTitle}
        position={position}
        width={width}
        height={height}
        welcomeMessage={welcomeMessage}
        placeholder={placeholder}
        onRefresh={() => {}}
        documents={[]}
        isInitializing={isInitializing}
        initError={initError}
        positionStrategy="absolute"
        theme={theme}
      />
    </div>
  );
}

