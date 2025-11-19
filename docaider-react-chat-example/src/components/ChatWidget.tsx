import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot } from "lucide-react";
import { useDocaiderChat } from "../hooks/useDocaiderChat";
import { ChatWidgetProps } from "../types";
import { ChatWindow } from "./ChatWindow";
import { ChatButton } from "./ChatButton";

export function ChatWidget({
  knowledgeBaseId,
  apiEndpoint = window.location.origin,
  position = "bottom-right",
  theme = {},
  appearance = {},
  behavior = {},
  onOpen,
  onClose,
  onMessageSent,
}: ChatWidgetProps) {
  // Merge defaults with provided config
  const config = {
    knowledgeBaseId,
    apiEndpoint,
    chatId: null,
    theme: {
      primaryColor: "#0091ff",
      textColor: "#FFFFFF",
      fontFamily: "system-ui, -apple-system, sans-serif",
      ...theme,
    },
    appearance: {
      width: "350px",
      height: "500px",
      iconSize: "50px",
      showButtonText: false,
      buttonText: "Chat with AI",
      title: "AI Assistant",
      ...appearance,
    },
    behavior: {
      welcomeMessage: "Hello! How can I help you today?",
      inputPlaceholder: "Ask a question...",
      autoOpen: false,
      ...behavior,
    },
  };

  const {
    isOpen,
    messages,
    isLoading,
    error,
    status,
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    stop,
  } = useDocaiderChat(config);

  // Handle open/close callbacks
  const handleOpen = React.useCallback(() => {
    openChat();
    onOpen?.();
  }, [openChat, onOpen]);

  const handleClose = React.useCallback(() => {
    closeChat();
    onClose?.();
  }, [closeChat, onClose]);

  const handleSendMessage = React.useCallback(
    (message: string) => {
      sendMessage(message);
      onMessageSent?.(message);
    },
    [sendMessage, onMessageSent]
  );

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            status={status}
            config={config}
            onClose={handleClose}
            onSendMessage={handleSendMessage}
            onStop={stop}
          />
        )}
      </AnimatePresence>

      <ChatButton
        isOpen={isOpen}
        config={config}
        onToggle={isOpen ? handleClose : handleOpen}
      />
    </div>
  );
}
