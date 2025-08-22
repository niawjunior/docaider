interface DocaiderChatConfig {
  knowledgeBaseId: string;
  chatboxTitle?: string;
  primaryColor?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
  iconSize?: string;
  welcomeMessage?: string;
  placeholder?: string;
  buttonText?: string;
  showButtonText?: boolean;
  textColor?: string;
}

declare global {
  interface Window {
    DocaiderChatConfig: DocaiderChatConfig;
  }
}

export {};
