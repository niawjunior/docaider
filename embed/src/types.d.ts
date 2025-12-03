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
    Docaider?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      setWelcomeMessage: (message?: string) => void;
      setMessage: (message: string) => void;
      sendMessage: (message: string) => void;
      useKnowledge: (nameOrContext: string | any, content?: any) => void;
    };
  }
}

export {};
