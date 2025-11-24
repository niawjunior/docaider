"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader } from "@/components/ai-elements/loader";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import { Message, MessageContent } from "./ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "./ai-elements/prompt-input";
import { Response } from "./ai-elements/response";
import Markdown from "./Markdown";
import clsx from "clsx";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "./ui/label";
import { Search } from "lucide-react";

interface EmbedChatBoxProps {
  knowledgeBaseId: string;
  src: string;
  chatId: string | null;
  chatboxTitle?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
  iconSize?: string;
  welcomeMessage?: string;
  placeholder?: string;
  buttonText?: string;
  showButtonText?: boolean;
  isInitializing?: boolean;
  initError?: Error | null;
}

export function EmbedChatBox({
  knowledgeBaseId,
  src,
  chatId,
  chatboxTitle = "AI Assistant",
  position = "bottom-right",
  width = "350px",
  height = "500px",
  iconSize = "50px",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Ask a question...",
  buttonText = "Chat with AI",
  showButtonText = false,
  isInitializing = false,
  initError = null,
}: EmbedChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [alwaysUseDocument, setAlwaysUseDocument] = useState(false);
  const alwaysUseDocumentRef = useRef(alwaysUseDocument);

  // Update ref when alwaysUseDocument changes
  useEffect(() => {
    alwaysUseDocumentRef.current = alwaysUseDocument;
  }, [alwaysUseDocument]);

  const [isToolCall, setIsToolCall] = useState(false);

  // Use the AI SDK's useChat hook
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${src}/api/embed/chat`,
      body: () => ({
        chatId: chatId!,
        knowledgeBaseId,
        alwaysUseDocument: alwaysUseDocumentRef.current,
      }),
    }),
    onToolCall: () => {
      setIsToolCall(true);
    },
    onFinish: () => {
      setIsToolCall(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    },
    id: chatId!,
  });

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage({ text: inputValue });
      setInputValue("");
    }
  };

  // Add welcome message if no messages exist
  const displayMessages =
    messages.length > 0
      ? messages
      : [
          {
            id: "welcome",
            role: "assistant",
            parts: [{ type: "text", text: welcomeMessage }],
          },
        ];

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
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg mb-2 overflow-hidden flex flex-col"
            style={{
              width,
              height,
              boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* Chat header */}
            <div
              className="p-3 flex items-center justify-between"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <Bot
                  className="h-5 w-5"
                  style={{ color: "var(--primary-foreground)" }}
                />
                <h3 className="font-medium">{chatboxTitle}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  className="h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none"
                  onClick={() => setIsOpen(false)}
                  style={{ color: "var(--primary-foreground)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <Conversation className="flex-1 overflow-y-auto">
              <ConversationContent className="flex flex-col">
                {displayMessages.map((msg) => (
                  <Message
                    key={msg.id}
                    from={msg.role as "user" | "assistant" | "system"}
                    className={clsx(
                      "relative",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <MessageContent
                      className={clsx(
                        "relative pb-4",
                        msg.role !== "user" && "min-w-[100%]"
                      )}
                      style={
                        msg.role === "user"
                          ? {
                              backgroundColor: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }
                          : {}
                      }
                    >
                      {msg.parts.map((part, index: number) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <Response key={`${msg.id}-${index}`}>
                                {part.type === "text"
                                  ? (part as { text?: string }).text || ""
                                  : ""}
                              </Response>
                            );
                          case "tool-askQuestion":
                            return (
                              <Markdown
                                key={`${msg.id}-${index}`}
                                isUser={msg.role === "user"}
                                text={
                                  part.type === "tool-askQuestion"
                                    ? (part as { output?: string }).output || ""
                                    : ""
                                }
                              />
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                    {status === "submitted" &&
                      msg.id === messages[messages.length - 1]?.id && (
                        <div className="flex items-center  gap-2 absolute left-[-20px] top-[100px] h-full">
                          <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
                            <div className="animate-pulse h-2 w-2 rounded-full bg-purple-600"></div>
                            <span className="flex items-center gap-2">
                              AI is thinking... <Loader />
                            </span>
                          </div>
                        </div>
                      )}
                  </Message>
                ))}
                <div ref={messagesEndRef} />
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {/* Chat status indicator */}
            {status === "streaming" && (
              <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 rounded-full bg-purple-600"></div>
                {isToolCall ? (
                  <span className="flex items-center gap-2">
                    Searching through documents...
                    <Loader />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    AI is responding...
                    <Loader />
                  </span>
                )}
                <button
                  className="ml-auto h-6 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  onClick={() => stop()}
                >
                  Stop
                </button>
              </div>
            )}

            {/* Initialization status */}
            {isInitializing && (
              <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 rounded-full bg-purple-600"></div>
                <span>Initializing chat...</span>
              </div>
            )}

            {/* Error indicators */}
            {initError && (
              <div className="px-3 py-1 text-xs text-red-500 flex items-center gap-2">
                <span>
                  Initialization Error:{" "}
                  {initError.message || "Failed to initialize chat"}
                </span>
              </div>
            )}

            {error && (
              <div className="px-3 py-1 text-xs text-red-500 flex items-center gap-2">
                <span>Error: {error.message || "Something went wrong"}</span>
                <button
                  className="ml-auto h-6 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  onClick={() => sendMessage({ text: inputValue })}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="px-4">
              {/* Chat input */}
              <PromptInput onSubmit={handleSendMessage} className="py-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <PromptInputTextarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={placeholder}
                      className="min-h-10 resize-none w-full rounded-md p-2 outline-none transition-colors"
                      style={{
                        border: "1px solid #d1d5db",
                      }}
                      disabled={
                        status === "streaming" || status === "submitted"
                      }
                    />
                  </div>
                  <PromptInputSubmit
                    status={
                      status === "streaming"
                        ? "streaming"
                        : status === "submitted"
                        ? "submitted"
                        : "ready"
                    }
                    disabled={
                      !inputValue.trim() ||
                      status === "streaming" ||
                      status === "submitted"
                    }
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                    className="w-10 h-10 rounded-md flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </PromptInput>

              {/* Document Search Toggle */}
              <div className="pb-3 flex items-center">
                <div className="flex items-center gap-2">
                  <Toggle
                    pressed={alwaysUseDocument}
                    onPressedChange={setAlwaysUseDocument}
                    variant="outline"
                    size="sm"
                    aria-label="Toggle document search"
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <Search className="h-4 w-4" />
                  </Toggle>
                  <Label htmlFor="always-use-document" className="text-xs">
                    Always search through documents
                  </Label>
                </div>
              </div>
            </div>
            {/* Powered by footer */}
            <div className="text-center text-xs p-1 text-gray-500 ">
              Powered by{" "}
              <a
                href="https://docaider.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Docaider
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex justify-end"
      >
        <button
          onClick={toggleChat}
          className={`shadow-lg ${
            showButtonText ? "rounded-lg px-4 py-2" : "rounded-full"
          } flex items-center justify-center transition-opacity hover:opacity-90 border-none outline-none`}
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            width: showButtonText ? "auto" : iconSize,
            height: showButtonText ? "auto" : iconSize,
          }}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {showButtonText && (
                <span className="font-medium">{buttonText}</span>
              )}
            </div>
          )}
        </button>
      </motion.div>
    </div>
  );
}
