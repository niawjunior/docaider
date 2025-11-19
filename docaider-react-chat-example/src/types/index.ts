export interface ChatWidgetProps {
  knowledgeBaseId: string;
  apiEndpoint?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: {
    primaryColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  appearance?: {
    width?: string;
    height?: string;
    iconSize?: string;
    showButtonText?: boolean;
    buttonText?: string;
    title?: string;
  };
  behavior?: {
    welcomeMessage?: string;
    inputPlaceholder?: string;
    autoOpen?: boolean;
  };
  onOpen?: () => void;
  onClose?: () => void;
  onMessageSent?: (message: string) => void;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  chatId: string | null;
}

export interface ChatConfig {
  knowledgeBaseId: string;
  apiEndpoint: string;
  chatId: string | null;
  theme: Required<ChatWidgetProps["theme"]>;
  appearance: Required<ChatWidgetProps["appearance"]>;
  behavior: Required<ChatWidgetProps["behavior"]>;
}
