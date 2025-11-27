interface DocaiderChatConfig {
  knowledgeBaseId: string;
  src: string;
  chatboxTitle?: string;
  theme?: "blue" | "gray" | "green";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
  welcomeMessage?: string;
  placeholder?: string;
}

declare global {
  interface Window {
    DocaiderChatConfig: DocaiderChatConfig;
  }
}

export {};
