"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage as AIMessage } from "ai";
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
  type PromptInputMessage,
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

export interface EmbedChatSessionRef {
  setMessage: (message: string) => void;
  sendMessage: (message: string) => void;
  useTool: (tool: string, options?: { content?: string; prompt?: string }) => void;
}

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
  externalContext?: any;
  initialSuggestions?: string[];
}

export const EmbedChatSession = forwardRef<EmbedChatSessionRef, EmbedChatSessionProps & { onClose?: () => void }>(({
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
  externalContext,
  initialSuggestions = [],
}, ref) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  const [activeTool, setActiveTool] = useState<"auto" | "knowledge-base" | "current-page" | "context">("auto");
  const activeToolRef = useRef(activeTool);
  const [contextData, setContextData] = useState<{ content?: string; prompt?: string } | null>(null);
  const contextDataRef = useRef(contextData);

  // Update ref when activeTool changes
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // Update ref when contextData changes
  useEffect(() => {
    contextDataRef.current = contextData;
  }, [contextData]);

  // Sync external context
  useEffect(() => {
    if (externalContext) {
      // externalContext is now a map of { name: content }
      const contextNames = Object.keys(externalContext);
      if (contextNames.length > 0) {
        // Default to the first context if no specific context tool is active
        // OR if we are currently in a context mode but the specific context might have changed
        
        // If we are already in context mode, check if the current prompt matches one of the new names
        // If not, switch to the first available context
        const currentContextName = contextData?.prompt;
        let targetName = contextNames[0];
        
        if (currentContextName && contextNames.includes(currentContextName)) {
            targetName = currentContextName;
        }

        const content = externalContext[targetName];
        const stringifiedContent = typeof content === 'string' ? content : JSON.stringify(content);
        
        setContextData({ content: stringifiedContent, prompt: targetName });
        setActiveTool('context'); // Use 'context' mode for named contexts to distinguish from generic auto
        
        // Update refs
        contextDataRef.current = { content: stringifiedContent, prompt: targetName };
        activeToolRef.current = 'context';
      }
    } else if (activeTool === 'context' && !externalContext) {
       // If external context is cleared and we were in context mode, reset to auto
      setContextData(null);
      setActiveTool('auto');
      contextDataRef.current = null;
      activeToolRef.current = 'auto';
    }
  }, [externalContext]);

  useImperativeHandle(ref, () => ({
    setMessage: (message: string) => {
      setInputValue(message);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    sendMessage: (message: string) => {
      setInputValue("");
      sendMessage({ text: message });
    },
    useTool: (tool: string, options?: { content?: string; prompt?: string }) => {
      stopAndExecute(() => {
        if (tool === 'context') {
          setContextData(options || null);
          setActiveTool('context');
          
          // Manually update refs for immediate usage since state updates are async
          // and useChat reads from these refs for the request body
          contextDataRef.current = options || null;
          activeToolRef.current = 'context';

          if (options?.prompt) {
              setInputValue("");
              sendMessage({ text: options.prompt });
              
              // Reset active tool to auto after sending context action
              // This prevents subsequent messages from being forced into context mode
              setTimeout(() => {
                  setActiveTool("auto");
                  activeToolRef.current = "auto";
              }, 500);
          }
        } else if (tool === 'readCurrentPage') {
          setInputValue("");
          setActiveTool('current-page');
          if (options?.content) {
              setInputValue("");
              sendMessage({ text: options.content });
          }
        } else if (tool === 'knowledge-base') {
          setActiveTool('knowledge-base');
          if (options?.content) {
              setInputValue("");
              sendMessage({ text: options.content });
          } 
        } else {
          setActiveTool('auto');
          if (options?.content) {
              setInputValue("");
              sendMessage({ text: options.content });
          }
        }

        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    },
  }));

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

        // Send context if it exists, regardless of mode (or specifically for auto/context)
        // User wants "auto" mode to include this context
        if ((activeToolRef.current === "context" || activeToolRef.current === "auto") && contextDataRef.current) {
          body.context = contextDataRef.current;
          
          // If we have explicit context in auto mode, we might want to disable other tools 
          // to prevent the LLM from trying to use search/askQuestion when it should use the context.
          // However, we still want it to be able to use tools if the context isn't sufficient?
          // The user requested: "when it auto it mean no active tool or no need to call tool"
          // So if we have context, we disable other tools.
          if (activeToolRef.current === "auto") {
             body.disableTools = true;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Focus input on mount or when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout to ensure visibility transition is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const stopAndExecute = (callback: () => void) => {
    if (status === 'streaming' || status === 'submitted') {
      stop();
      setTimeout(callback, 10);
    } else {
      callback();
    }
  };

  const handleSendMessage = (message: PromptInputMessage, e: React.FormEvent) => {
    e.preventDefault();
    if (message.text.trim()) {
      stopAndExecute(() => {
        sendMessage({ text: message.text });
        setInputValue("");
      });
    }
  };

  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch suggestions when contextData changes or on mount (for KB instruction)
  useEffect(() => {
    const fetchSuggestions = async () => {
      // We fetch if there is context OR if we have a knowledgeBaseId (for auto mode)
      if (contextData?.content || knowledgeBaseId) {
        setIsLoadingSuggestions(true);
        try {
          const response = await fetch(`${src}/api/suggestions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                context: contextData?.content,
                knowledgeBaseId 
            }),
          });
          const data = await response.json();
          if (data.questions && Array.isArray(data.questions)) {
            setSuggestions(data.questions);
          }
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    // Debounce slightly to avoid rapid calls if context changes fast
    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [contextData, src, knowledgeBaseId]);

  const handleQuickAction = (text: string) => {
    stopAndExecute(() => {
      sendMessage({ text });
    });
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
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[35px] border-4 border-red-100 bg-red-50 p-6 text-center text-red-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-nunito">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <X className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-bold">Oops! Something went wrong</h3>
        <p className="text-sm opacity-80">{initError.message}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-[var(--theme-border)] border-solid flex flex-col font-nunito">
    
      {/* Header */}
      <div className="bg-[var(--theme-primary)] p-4 flex items-center justify-between relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0 100 Q 25 50 50 100 T 100 100 V 0 H 0 Z" fill="white"></path>
            </svg>
        </div>

        <div className="flex items-center gap-3 z-10 text-white">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--theme-accent)] animate-[bounce_2s_infinite]">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                    <path d="M10,50 Q10,10 50,10 Q90,10 90,50" fill="#8B4513" stroke="#5A2D0C" strokeWidth="2"></path>
                    <path d="M10,50 Q20,30 30,45 Q40,25 50,45 Q60,25 70,45 Q80,30 90,50" fill="#8B4513"></path>
                    <path d="M10,40 Q50,-10 90,40 Z" fill="var(--theme-primary)"></path>
                    <rect x="25" y="35" width="50" height="10" rx="5" fill="var(--theme-text-primary)"></rect>
                    <circle cx="35" cy="60" r="4" fill="#333"></circle>
                    <circle cx="65" cy="60" r="4" fill="#333"></circle>
                    <circle cx="25" cy="70" r="5" fill="#FFB6C1" opacity="0.6"></circle>
                    <circle cx="75" cy="70" r="5" fill="#FFB6C1" opacity="0.6"></circle>
                    <path d="M40,75 Q50,85 60,75" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
            </div>
            <div>
                <h1 className="font-extrabold text-xl tracking-wide my-1">{title}</h1>
                <div className="flex items-center gap-1 text-xs font-semibold bg-[var(--theme-text-secondary)] bg-opacity-40 px-2 py-0.5 rounded-full w-fit justify-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    Online
                </div>
            </div>
        </div>

        <div className="flex gap-3 z-10 text-white opacity-90">
            {onClose && (
                <button className="flex justify-center items-center text-white hover:bg-[var(--theme-primary-dark)] p-1.5 rounded-xl transition-colors" onClick={onClose}>
                   <div className="h-5 w-5 flex items-center justify-center font-bold text-lg leading-none">−</div>
                </button>
            )}
            <button className="flex justify-center items-center text-white hover:bg-[var(--theme-primary-dark)] p-1.5 rounded-xl transition-colors" onClick={clearChat}>
                 <Trash2 className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Chat messages */}
      <Conversation className="flex-1 overflow-y-auto bg-[var(--theme-secondary)] p-4 custom-scrollbar">
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
                 <div className="w-8 h-8 rounded-full bg-[var(--theme-accent)] border border-[var(--theme-accent-dark)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-6 h-6">
                        <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                        <path d="M10,40 Q50,-10 90,40 Z" fill="var(--theme-primary)"></path>
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
                    ? "bg-[var(--theme-primary)] text-white rounded-2xl rounded-br-none shadow-md" 
                    : "bg-white text-gray-700 rounded-2xl rounded-bl-none border-solid border-[var(--theme-border)] shadow-sm"
                )}
              >
                {msg.parts.map((part, index: number) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div key={`${msg.id}-${index}`}>
                          <MessageResponse>{(part as { text?: string }).text || ""}</MessageResponse>
                        </div>
                      );
                    case "tool-askQuestion":
                    case "tool-readCurrentPage":
                    case "tool-context":
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
          {(status === "submitted" || (status === "streaming" && messages.length > 0 && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].parts.some(p => p.type === "text" && (p as any).text?.length > 0))) && (
            <div className="flex gap-3 items-end animate-[fadeIn_0.3s_ease-out]">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-accent)] border border-[var(--theme-accent-dark)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                     <svg viewBox="0 0 100 100" className="w-6 h-6">
                        <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                        <path d="M10,40 Q50,-10 90,40 Z" fill="var(--theme-primary)"></path>
                        <circle cx="35" cy="60" r="4" fill="#333"></circle>
                        <circle cx="65" cy="60" r="4" fill="#333"></circle>
                        <path d="M40,75 Q50,85 60,75" fill="none" stroke="#333" strokeWidth="2"></path>
                    </svg>
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-[var(--theme-border)]">
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
      {(suggestions.length > 0 || isLoadingSuggestions) && (
      <div className="px-4 py-2 bg-white flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 z-20 min-h-[36px]">
        {isLoadingSuggestions ? (
             <>
                <div className="flex-shrink-0 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full w-32 h-[24px] animate-pulse"></div>
                <div className="flex-shrink-0 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full w-24 h-[24px] animate-pulse"></div>
                <div className="flex-shrink-0 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full w-28 h-[24px] animate-pulse"></div>
             </>
        ) : (
            suggestions.map((question, idx) => (
                <button 
                    key={idx}
                    onClick={() => handleQuickAction(question)} 
                    className="flex-shrink-0 bg-white hover:bg-[var(--theme-secondary)] text-[var(--theme-text-primary)] border border-[var(--theme-border-highlight)] px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                    <span>{question}</span>
                </button>
            ))
        )}
      </div>
      )}

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
        <PromptInput onSubmit={handleSendMessage} className="border-none shadow-none bg-transparent prompt-input-override">
          <div className="relative flex justify-center w-full">
            <PromptInputTextarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-8 bg-gray-100 hover:border-[var(--theme-accent-dark)] text-gray-700 placeholder-gray-400 rounded-[24px]  resize-none p-3 outline-none transition-colors py-4 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus-visible:border-[var(--theme-accent-dark)] focus:bg-white transition-all border-2 border-[var(--theme-border)] border-solid shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-sm font-semibold"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage({ text: inputValue, files: [] }, e);
                    }
                }}
            />
            <div className="absolute right-2 bottom-2 top-2 flex items-center">
                <PromptInputSubmit className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] hover:rotate-12 text-white rounded-[18px] w-10 h-10 flex items-center justify-center shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
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
                    <button className="text-[10px] font-bold text-gray-400 hover:text-[var(--theme-text-secondary)] flex items-center gap-1 transition-colors bg-gray-50 px-2 py-1 rounded-full">
                      <ChevronDown className="w-3 h-3" />
                      <span>
                        {activeTool === "auto" ? "Auto Smart" : 
                         activeTool === "knowledge-base" ? "Knowledge Base Only" : 
                         activeTool === "current-page" ? "Read Current Page" :
                         activeTool === "context" ? (contextData?.prompt || "Context") : "Select Tool"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[200px] bg-white dark:bg-zinc-950" container={containerRef.current}>
                    <DropdownMenuCheckboxItem
                      checked={activeTool === "auto"}
                      onCheckedChange={() => {
                        setActiveTool("auto");
                        setContextData(null);
                        contextDataRef.current = null;
                        activeToolRef.current = "auto";
                      }}
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
                    
                    {/* Dynamic Context Options */}
                    {externalContext && Object.keys(externalContext).map((name) => (
                      <DropdownMenuCheckboxItem
                        key={name}
                        checked={activeTool === "context" && contextData?.prompt === name}
                        onCheckedChange={() => {
                            const content = externalContext[name];
                            const stringifiedContent = typeof content === 'string' ? content : JSON.stringify(content);
                            setContextData({ content: stringifiedContent, prompt: name });
                            setActiveTool("context");
                            contextDataRef.current = { content: stringifiedContent, prompt: name };
                            activeToolRef.current = "context";
                        }}
                        className="text-xs w-full cursor-pointer"
                      >
                        {name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <a href="https://docaider.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-300 hover:text-[var(--theme-text-secondary)] transition-colors cursor-pointer">
                Powered by <span className="text-[var(--theme-text-secondary)]">Docaider</span>
            </a>
        </div>
      </div>
    </div>
  );
});
