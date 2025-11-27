"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EmbedChatBox = dynamic(
  () => import("@docaider/embed").then((mod) => mod.EmbedChatBox),
  { ssr: false }
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

export function EmbedChatBoxPreview({
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (rootRef.current) {
      const shadow = rootRef.current.shadowRoot || rootRef.current.attachShadow({ mode: "open" });
      setShadowRoot(shadow);
    }
  }, []);

  // We need to set CSS variables for the embed component to use
  const style = {
  
  } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      className="relative w-full h-full"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
      }}
    >
      {shadowRoot &&
        createPortal(
          <>
            <link rel="stylesheet" href="/embed-style.css" />
            <div style={style}>
              <EmbedChatBox
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
          </>,
          shadowRoot as any
        )}
    </div>
  );
}
