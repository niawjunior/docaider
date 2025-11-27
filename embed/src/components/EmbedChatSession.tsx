"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader } from "@/components/ai-elements/loader";
import { ChevronDown, Sparkles, Brain, Smile, Trash2, X } from "lucide-react";

import {
  Conversation,
  ConversationContent,
} from "./ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "./ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "./ai-elements/prompt-input";

import clsx from "clsx";
import { ToolRow } from "./ai-elements/tool-row";
import { type ToolUIPart } from "ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { readCurrentPage } from "../utils/page-reader";

interface EmbedChatSessionProps {
  knowledgeBaseId: string;
  src: string;
  chatId: string;
  welcomeMessage?: string;
  placeholder?: string;
  isInitializing?: boolean;
  initError?: Error | null;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export function EmbedChatSession({
  knowledgeBaseId,
  src,
  chatId,
  welcomeMessage = "Heeey! 👋 So happy you're here! What can Little Helper do for you today? ✨😊",
  placeholder = "Ask me anything...",
  isInitializing = false,
  initError = null,
  isOpen = false,
  onClose,
  title = "Little Helper",
}: EmbedChatSessionProps & { onClose?: () => void }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [activeTool, setActiveTool] = useState<"auto" | "knowledge-base" | "current-page">("auto");
  const activeToolRef = useRef(activeTool);
console.log(isInitializing)
  // Update ref when activeTool changes
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const [isToolCall, setIsToolCall] = useState(false);

  // Use the AI SDK's useChat hook
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    
    transport: new DefaultChatTransport({
      api: `${src}/api/chat`,
      body: () => {
        const body: any = {
          chatId: chatId,
          knowledgeBaseId,
          isEmbed: true,
          activeTool: activeToolRef.current,
        };

        if (activeToolRef.current === "current-page" || activeToolRef.current === "auto") {
          const pageContent = readCurrentPage();
          if (pageContent) {
            body.pageContent = pageContent;
          }
        }

        return body;
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

  // Focus input on mount or when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout to ensure visibility transition is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage({ text: inputValue });
      setInputValue("");
    }
  };

  const handleQuickAction = (type: 'story' | 'fact' | 'joke') => {
    let text = "";
    if (type === 'story') {
      text = "Tell me a very short, cute story about a magical animal (max 3 sentences). Use emojis! 🦄";
    } else if (type === 'fact') {
      text = "Tell me a fun, mind-blowing fact for kids about nature or space (max 2 sentences). Use emojis! 🌍";
    } else if (type === 'joke') {
      text = "Tell me a silly clean joke for kids. Use emojis! 😂";
    }
    sendMessage({ text });
  };

  const clearChat = () => {
    setMessages([]);
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

  const containerRef = useRef<HTMLDivElement>(null);

  if (initError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[35px] border-4 border-red-100 bg-red-50 p-6 text-center text-red-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-['nunito']">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <X className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-bold">Oops! Something went wrong</h3>
        <p className="text-sm opacity-80">{initError.message}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-blue-100 border-solid flex flex-col font-['nunito']">
    
      {/* Header */}
      <div className="bg-blue-400 p-4 flex items-center justify-between relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0 100 Q 25 50 50 100 T 100 100 V 0 H 0 Z" fill="white"></path>
            </svg>
        </div>

        <div className="flex items-center gap-3 z-10 text-white">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-200 animate-[bounce_2s_infinite]">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                    <path d="M10,50 Q10,10 50,10 Q90,10 90,50" fill="#8B4513" stroke="#5A2D0C" strokeWidth="2"></path>
                    <path d="M10,50 Q20,30 30,45 Q40,25 50,45 Q60,25 70,45 Q80,30 90,50" fill="#8B4513"></path>
                    <path d="M10,40 Q50,-10 90,40 Z" fill="#4299E1"></path>
                    <rect x="25" y="35" width="50" height="10" rx="5" fill="#2B6CB0"></rect>
                    <circle cx="35" cy="60" r="4" fill="#333"></circle>
                    <circle cx="65" cy="60" r="4" fill="#333"></circle>
                    <circle cx="25" cy="70" r="5" fill="#FFB6C1" opacity="0.6"></circle>
                    <circle cx="75" cy="70" r="5" fill="#FFB6C1" opacity="0.6"></circle>
                    <path d="M40,75 Q50,85 60,75" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
            </div>
            <div>
                <h1 className="font-extrabold text-xl tracking-wide">{title}</h1>
                <div className="flex items-center gap-1 text-xs font-semibold bg-blue-500 bg-opacity-40 px-2 py-0.5 rounded-full">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    Online
                </div>
            </div>
        </div>

        <div className="flex gap-3 z-10 text-white opacity-90">
            {onClose && (
                <button className="hover:bg-blue-500 p-1.5 rounded-xl transition-colors" onClick={onClose}>
                   <div className="h-5 w-5 flex items-center justify-center font-bold text-lg leading-none">−</div>
                </button>
            )}
            <button className="hover:bg-blue-500 p-1.5 rounded-xl transition-colors" onClick={clearChat}>
                 <Trash2 className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Chat messages */}
      <Conversation className="flex-1 overflow-y-auto bg-blue-50 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <ConversationContent className="flex flex-col gap-4">
          <div className="flex w-full justify-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">Today</span>
          </div>

          {displayMessages.map((msg) => (
            <Message
              key={msg.id}
              from={msg.role as "user" | "assistant" | "system"}
              className={clsx(
                "relative flex flex-row gap-3 items-end animate-[fadeIn_0.3s_ease-out] max-w-full",
                msg.role === "user" ? "justify-end w-full" : "justify-start"
              )}
            >
              {msg.role !== "user" && (
                 <div className="w-8 h-8 rounded-full bg-blue-200 border border-blue-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-6 h-6">
                        <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                        <path d="M10,40 Q50,-10 90,40 Z" fill="#4299E1"></path>
                        <circle cx="35" cy="60" r="4" fill="#333"></circle>
                        <circle cx="65" cy="60" r="4" fill="#333"></circle>
                        <path d="M40,75 Q50,85 60,75" fill="none" stroke="#333" strokeWidth="2"></path>
                    </svg>
                </div>
              )}

              <MessageContent
                className={clsx(
                  "relative p-4 max-w-[85%] text-sm font-semibold",
                  msg.role === "user" 
                    ? "bg-blue-500 text-white rounded-2xl rounded-br-none shadow-md" 
                    : "bg-white text-gray-700 rounded-2xl rounded-bl-none border-solid border-blue-100 shadow-sm"
                )}
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
                    case "tool-readCurrentPage":
                      const toolPart = part as ToolUIPart;
                      return (
                        <ToolRow
                          key={`${msg.id}-${index}`}
                          part={toolPart}
                          toolName={(toolPart as any).toolName || part.type.replace("tool-", "")}
                          defaultOpen={false}
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
          
          {status === "submitted" && (
            <div className="flex gap-3 items-end animate-[fadeIn_0.3s_ease-out]">
                <div className="w-8 h-8 rounded-full bg-blue-200 border border-blue-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                     <svg viewBox="0 0 100 100" className="w-6 h-6">
                        <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                        <path d="M10,40 Q50,-10 90,40 Z" fill="#4299E1"></path>
                        <circle cx="35" cy="60" r="4" fill="#333"></circle>
                        <circle cx="65" cy="60" r="4" fill="#333"></circle>
                        <path d="M40,75 Q50,85 60,75" fill="none" stroke="#333" strokeWidth="2"></path>
                    </svg>
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-blue-100">
                     <svg height="20" width="40" className="loader">
                        <circle className="typing-dot" cx="10" cy="10" r="4" />
                        <circle className="typing-dot" cx="20" cy="10" r="4" />
                        <circle className="typing-dot" cx="30" cy="10" r="4" />
                    </svg>
                </div>
            </div>
          )}
        </ConversationContent>
      </Conversation>

      {/* Quick Actions Bar */}
      {/* <div className="px-4 py-2 bg-white flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 z-20">
        <button onClick={() => handleQuickAction('story')} className="flex-shrink-0 bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Magic Story ✨</span>
        </button>
        <button onClick={() => handleQuickAction('fact')} className="flex-shrink-0 bg-white hover:bg-green-50 text-green-600 border border-green-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span>Fun Fact ✨</span>
        </button>
         <button onClick={() => handleQuickAction('joke')} className="flex-shrink-0 bg-white hover:bg-yellow-50 text-yellow-600 border border-yellow-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5" />
            <span>Tell a Joke ✨</span>
        </button>
      </div> */}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-xl bg-red-50 p-3 text-xs font-medium text-red-500 border border-red-100">
          <span>An error occurred. Please try again.</span>
          <button onClick={() => window.location.reload()} className="underline hover:text-red-600">
            Retry
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white relative z-20 shrink-0 pt-2">
        <PromptInput onSubmit={handleSendMessage} className="border-none shadow-none bg-transparent">
          <div className="relative">
            <PromptInputTextarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-100 hover:border-blue-300 text-gray-700 placeholder-gray-400 rounded-[24px] pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus-visible:border-blue-300 focus:bg-white transition-all border-2 border-blue-100 border-solid resize-none shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-sm"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
            />
            <div className="absolute right-2 bottom-2 top-2 flex items-center">
                <PromptInputSubmit className="bg-blue-400 hover:bg-blue-500 hover:rotate-12 text-white rounded-[18px] w-10 h-10 flex items-center justify-center shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-12 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                </PromptInputSubmit>
            </div>
          </div>
        </PromptInput>

        <div className="mt-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors bg-gray-50 px-2 py-1 rounded-full">
                      <ChevronDown className="w-3 h-3" />
                      <span>{activeTool === "auto" ? "Auto Smart" : activeTool === "knowledge-base" ? "Knowledge Base Only" : "Read Current Page"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[200px] bg-white dark:bg-zinc-950" container={containerRef.current}>
                    <DropdownMenuCheckboxItem
                      checked={activeTool === "auto"}
                      onCheckedChange={() => setActiveTool("auto")}
                      className="text-xs w-full cursor-pointer"
                    >
                      Auto (Smart)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeTool === "knowledge-base"}
                      onCheckedChange={() => setActiveTool("knowledge-base")}
                      className="text-xs w-full cursor-pointer"
                    >
                      Knowledge Base Only
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeTool === "current-page"}
                      onCheckedChange={() => setActiveTool("current-page")}
                      className="text-xs w-full cursor-pointer"
                    >
                      Read Current Page
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <a href="https://docaider.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-300 hover:text-blue-300 transition-colors cursor-pointer">
                Powered by <span className="text-blue-300">Docaider</span>
            </a>
        </div>
      </div>
    </div>
  );
}
