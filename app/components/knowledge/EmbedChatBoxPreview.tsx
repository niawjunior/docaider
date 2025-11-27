"use client";

import { useState, useRef, useEffect } from "react";

const Typewriter = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

import { MessageCircle, X, Bot } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import clsx from "clsx";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import Markdown from "../Markdown";
import {
  PromptInput,
  PromptInputBody,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { ToolRow } from "@/components/ai-elements/tool-row";
import { type ToolUIPart } from "ai";

interface EmbedChatBoxPreviewProps {
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
  primaryColor?: string;
  textColor?: string;
  isInitializing?: boolean;
  initError?: Error | null;
}

export function EmbedChatBoxPreview({
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
  primaryColor = "#7C3AED",
  textColor = "#FFFFFF",
  isInitializing = false,
  initError = null,
}: EmbedChatBoxPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isToolCall, setIsToolCall] = useState(false);

  // Use the AI SDK's useChat hook
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat`,
      prepareSendMessagesRequest: ({ id, messages }) => {
        console.log(chatId, knowledgeBaseId);
        return {
          body: {
            id,
            messages,
            chatId: chatId!,
            knowledgeBaseId,
            isEmbed: true,
          },
        };
      },
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

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText) {
      return;
    }
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
    "bottom-right": "bottom-16 right-8",
    "bottom-left": "bottom-16 left-8",
    "top-right": "top-12 right-8",
    "top-left": "top-12 left-8",
  };

  return (
    <div className={`absolute z-50`}>
      {isOpen && (
        <div
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
              backgroundColor: primaryColor,
              color: textColor,
              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" style={{ color: textColor }} />
              <h3 className="font-medium">{chatboxTitle}</h3>
            </div>
            <div className="flex gap-1">
              <button
                className="h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none"
                onClick={() => setIsOpen(false)}
                style={{ color: textColor }}
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
                  {status === "submitted" &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <div className="flex items-center  gap-2 absolute left-[-78px] top-[65px]">
                        <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
                          <div className="animate-pulse h-2 w-2 rounded-full bg-purple-600"></div>
                          <span className="flex items-center gap-2">
                            AI is thinking... <Loader />
                          </span>
                        </div>
                      </div>
                    )}
                  <MessageContent
                    className={clsx(
                      "relative",
                      msg.role !== "user" && "min-w-[100%]"
                    )}
                    style={
                      msg.role === "user"
                        ? {
                            backgroundColor: primaryColor,
                            color: textColor,
                          }
                        : {}
                    }
                  >
                    {msg.parts.map((part, index: number) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <MessageResponse key={`${msg.id}-${index}`}>
                              {part.type === "text"
                                ? (part as { text?: string }).text || ""
                                : ""}
                            </MessageResponse>
                          );
                        case "tool-askQuestion":
                          const toolPart = part as ToolUIPart;
                          return (
                            <ToolRow
                              key={`${msg.id}-${index}`}
                              part={toolPart}
                              toolName="Ask Question"
                              defaultOpen={true}
                            />
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
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
            {/* <PromptInput
              onSubmit={handleSubmit}
              className="p-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="flex gap-2">
                <PromptInputTextarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="min-h-10 resize-none w-full rounded-md p-2 outline-none transition-colors"
                  style={{
                    border: "1px solid #d1d5db",
                  }}
                  disabled={status === "streaming" || status === "submitted"}
                />
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
                    backgroundColor: primaryColor,
                    color: textColor,
                  }}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </PromptInput> */}

            <PromptInput
              onSubmit={handleSubmit}
              className="mt-4"
              globalDrop
              multiple
            >
              <PromptInputBody>
                <PromptInputTextarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="min-h-10 resize-none w-full rounded-md p-2 outline-none transition-colors"
                  style={{
                    border: "1px solid #d1d5db",
                  }}
                  disabled={status === "streaming" || status === "submitted"}
                />
              </PromptInputBody>
            </PromptInput>
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
        </div>
      )}

      {/* Chat toggle button */}
      {!isOpen && (
        <div className="flex justify-end">
          <button
            onClick={toggleChat}
            className={`shadow-none bg-transparent p-0 flex items-center justify-center transition-all hover:scale-105 border-none outline-none`}
            style={{
              width: "auto",
              height: "auto",
            }}
          >
            <div className="flex items-end gap-4">
              {/* Typing Bubble */}
              <div className="bg-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg mb-4 max-w-[200px] hidden md:block">
                <p className="text-sm text-gray-700 font-medium">
                  <Typewriter text="สวัสดีครับ มีอะไรให้ผมช่วยมั้ยครับ" />
                </p>
              </div>

              {/* Avatar */}
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-200 animate-[bounce_2s_infinite]">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                  <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                  <path
                    d="M10,50 Q10,10 50,10 Q90,10 90,50"
                    fill="#8B4513"
                    stroke="#5A2D0C"
                    strokeWidth="2"
                  ></path>
                  <path
                    d="M10,50 Q20,30 30,45 Q40,25 50,45 Q60,25 70,45 Q80,30 90,50"
                    fill="#8B4513"
                  ></path>
                  <path d="M10,40 Q50,-10 90,40 Z" fill="#4299E1"></path>
                  <rect
                    x="25"
                    y="35"
                    width="50"
                    height="10"
                    rx="5"
                    fill="#2B6CB0"
                  ></rect>
                  <circle cx="35" cy="60" r="4" fill="#333"></circle>
                  <circle cx="65" cy="60" r="4" fill="#333"></circle>
                  <circle
                    cx="25"
                    cy="70"
                    r="5"
                    fill="#FFB6C1"
                    opacity="0.6"
                  ></circle>
                  <circle
                    cx="75"
                    cy="70"
                    r="5"
                    fill="#FFB6C1"
                    opacity="0.6"
                  ></circle>
                  <path
                    d="M40,75 Q50,85 60,75"
                    fill="none"
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
