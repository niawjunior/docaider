// Main exports
export { ChatWidget } from "./components/ChatWidget";
export { ChatWindow } from "./components/ChatWindow";
export { ChatButton } from "./components/ChatButton";
export { MessageInput } from "./components/MessageInput";
export { useDocaiderChat } from "./hooks/useDocaiderChat";

// Type exports
export type {
  ChatWidgetProps,
  ChatMessage,
  ChatState,
  ChatConfig,
} from "./types";

// Default export
export { ChatWidget as default } from "./components/ChatWidget";
