import { useState, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatState, ChatConfig } from "../types";

interface UseDocaiderChatReturn {
  // State
  isOpen: boolean;
  messages: any[];
  isLoading: boolean;
  error: string | null | undefined;
  chatId: string | null;
  status: string;

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
  stop: () => void;

  // Config
  config: ChatConfig;
}

export function useDocaiderChat(config: ChatConfig): UseDocaiderChatReturn {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: config.behavior?.autoOpen || false,
    messages: [],
    isLoading: false,
    error: null,
    chatId: null,
  });

  // Initialize chat session
  const initializeChat = useCallback(async () => {
    if (chatState.chatId) return;

    setChatState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `${config.apiEndpoint}/api/embed/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            knowledgeBaseId: config.knowledgeBaseId,
            referrer: window.location.href,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initialize chat");
      }

      const data = await response.json();
      setChatState((prev) => ({
        ...prev,
        chatId: data.chatId,
        isLoading: false,
      }));
    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to initialize chat",
        isLoading: false,
      }));
    }
  }, [config.apiEndpoint, config.knowledgeBaseId, chatState.chatId]);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // AI SDK chat hook
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${config.apiEndpoint}/api/embed/chat`,
      body: {
        chatId: chatState.chatId!,
        knowledgeBaseId: config.knowledgeBaseId,
      },
    }),
    id: chatState.chatId!,
    onFinish: () => {
      // Auto-focus input after message is complete
    },
  });

  const toggleChat = useCallback(() => {
    setChatState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const openChat = useCallback(() => {
    setChatState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeChat = useCallback(() => {
    setChatState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (message.trim() && status !== "streaming") {
        sendMessage({ text: message });
      }
    },
    [sendMessage, status]
  );

  // Add welcome message if no messages exist
  const displayMessages =
    messages.length > 0
      ? messages
      : [
          {
            id: "welcome",
            role: "assistant" as const,
            content:
              config.behavior?.welcomeMessage ||
              "Hello! How can I help you today?",
            parts: [
              {
                type: "text",
                text:
                  config.behavior?.welcomeMessage ||
                  "Hello! How can I help you today?",
              },
            ],
          },
        ];

  return {
    // State
    isOpen: chatState.isOpen,
    messages: displayMessages,
    isLoading: chatState.isLoading || status === "submitted",
    error: chatState.error || error?.message,
    chatId: chatState.chatId,
    status,

    // Actions
    toggleChat,
    openChat,
    closeChat,
    sendMessage: handleSendMessage,
    stop,

    // Config
    config,
  };
}
