"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader } from "@/components/ai-elements/loader";
import { Search } from "lucide-react";

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

import Markdown from "./Markdown";
import clsx from "clsx";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "./ui/label";

interface EmbedChatSessionProps {
  knowledgeBaseId: string;
  src: string;
  chatId: string;
  welcomeMessage?: string;
  placeholder?: string;
  isInitializing?: boolean;
  initError?: Error | null;
}

export function EmbedChatSession({
  knowledgeBaseId,
  src,
  chatId,
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Ask a question...",
  isInitializing = false,
  initError = null,
}: EmbedChatSessionProps) {
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
        chatId: chatId,
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
    id: chatId,
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

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
                  "relative",
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
                        <div key={`${msg.id}-${index}`}>
                          <Markdown
                            isUser={msg.role === "user"}
                            text={
                              part.type === "text"
                                ? (part as { text?: string }).text || ""
                                : ""
                            }
                          />
                        </div>
                      );
                    case "tool-askQuestion":
                      const output = (part as { output?: any }).output;
                      let answer = "";
                      
                      if (typeof output === "string") {
                        answer = output;
                      } else if (output && typeof output === "object") {
                        answer = output.answer || "";
                      }

                      return (
                        <div key={`${msg.id}-${index}`}>
                          <Markdown
                            isUser={msg.role === "user"}
                            text={answer}
                          />
                        </div>
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
                      <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
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
          <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
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
          <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
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
          className="text-primary hover:underline"
        >
          Docaider
        </a>
      </div>
    </div>
  );
}
