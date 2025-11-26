"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useSupabaseSession from "../hooks/useSupabaseSession";
import GlobalLoader from "./GlobalLoader";
import { useTranslations } from "next-intl";

// AI Elements Imports
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
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputAttachments,
  PromptInputAttachment,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { ToolRow } from "@/components/ai-elements/tool-row";
import { type ToolUIPart } from "ai";

import DocumentUploadDialog from "./chat/DocumentUploadDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FaShare } from "react-icons/fa";
import useUserConfig from "../hooks/useUserConfig";
import AudioRecorder from "./chat/AudioRecorder";

interface ChatFormProps {
  chatId?: string;
  suggestedPrompts?: { title: string; subtitle?: string }[];
  isKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
  onFinished?: () => void;
}

export default function ChatForm({
  chatId,
  isKnowledgeBase = false,
  knowledgeBaseId,
  onFinished,
}: ChatFormProps) {
  const t = useTranslations("chat");
  const settingsT = useTranslations("settings");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { session } = useSupabaseSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<any>(null);

  const {
    data: initialMessages,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) {
        return [];
      }
      const response = await fetch(
        `/api/chats/${chatId}?isKnowledgeBase=${isKnowledgeBase}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat data");
      }
      return response.json();
    },
    enabled: !!chatId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use the hook to get and update user config
  const {
    config,
    updateConfig,
    loading: configSaving,
    isUpdating: configUpdating,
  } = useUserConfig(session?.user?.id || "");

  const { messages, status, sendMessage, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            id,
            messages,
            isKnowledgeBase,
            knowledgeBaseId,
          },
        };
      },
    }),
    id: chatId,
    onFinish: async ({ message }) => {
      const toolCalls =
        message.parts?.filter(
          (part: any) => part.type === "tool-askQuestion"
        ) || [];

      onFinished?.();

      if (!isKnowledgeBase) {
        await queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      }

      if (
        toolCalls?.length &&
        toolCalls[0].type === "tool-askQuestion" &&
        config?.useVoiceMode
      ) {
        const messageText = toolCalls[0].output as string;
        handleTextToSpeech(messageText);
      }
      await queryClient.invalidateQueries({
        queryKey: ["credit", session?.user?.id],
      });

      // Focus input after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    onError: (error) => {
      console.log("onError", error);
      toast.error(error.message);
    },
  });

  const handleSubmit = useCallback(
    (message: PromptInputMessage, e?: React.FormEvent) => {
      e?.preventDefault();
      // Get the current input value directly from state to ensure we have the latest value
      const currentInput = message.text || input;
      if (!currentInput.trim() || configSaving || configUpdating) return;
      sendMessage({ text: currentInput });
      setInput("");
    },
    [input, configSaving, configUpdating, sendMessage]
  );

  const handleTextToSpeech = async (text: string) => {
    if (!text) return;

    toast.dismiss();
    setIsSpeaking(true);
    toastRef.current = toast.info(t("speaking"), {
      duration: Infinity,
    });

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: "sage",
          model: "gpt-4o-mini-tts",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Add a small delay before setting isSpeaking to false
      setTimeout(() => {
        setIsSpeaking(false);
        toast.dismiss(toastRef.current?.id);
        toast.success("Audio playback completed", { duration: 1000 });
        toast.success(`Used 1 credit.`, { duration: 1000 });
      }, 300); // 300ms delay to ensure voice has completely finished
    } catch (error) {
      toast.dismiss();
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio");
      setIsSpeaking(false);
    }
  };

  const handleVoiceModeToggle = async (value: boolean) => {
    // Update user config
    await updateConfig({
      useVoiceMode: value,
    });
    toast.success(settingsT("saveSuccess"));

    queryClient.invalidateQueries({ queryKey: ["config", session?.user?.id] });
  };

  const handdleRequiredDocument = async () => {
    // Update user config
    await updateConfig({
      useDocument: !config?.useDocument,
    });
    toast.success(settingsT("saveSuccess"));
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    if (status === "ready" && messages.length && config?.useVoiceMode) {
      // Get the last message text for text-to-speech
      const lastMessage: any =
        messages[messages.length - 1].parts?.[
          messages[messages.length - 1].parts?.length - 1
        ];
      const messageText = lastMessage?.text;

      // Use the state directly instead of checking DOM
      if (messageText) {
        handleTextToSpeech(messageText);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Auto-focus input on mount and when chatId changes
  useEffect(() => {
    if (!isLoading && !isFetching) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatId, isLoading, isFetching]);

  // Global key listener for typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Only focus for single character keys (letters, numbers, symbols)
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Only show the global loader for non-knowledge base chats when loading initial data
  if ((isLoading || isFetching) && !isKnowledgeBase && !messages.length) {
    return <GlobalLoader />;
  }

  const handleTranscriptionComplete = (text: string) => {
    setInput(text);
    setCurrentTranscription("");
    setIsTranscribing(false);
    // focus on textarea after transcription
    inputRef.current?.focus();
    // Auto submit after transcription if desired, or just let user review
    // setTimeout(() => handleSubmit({ text, files: [] }), 100);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden w-full ">
      <Conversation className="flex-1 overflow-y-auto  max-h-[calc(100vh-480px)] scroll-hidden px-2">
        <ConversationContent className="flex flex-col gap-4">
          {messages.map((msg) => (
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
          {status === "submitted" && (
            <div className="flex items-center justify-center">
                    <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
                      <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
                      <span className="flex items-center gap-2">
                        AI is thinking... <Loader />
                      </span>
                    </div>
                  </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat status indicator */}
      {status === "streaming" && (
        <div className="px-3 py-1 text-xs text-gray-500 flex items-center gap-2 justify-center">
          <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
          <span className="flex items-center gap-2">
            AI is responding...
            <Loader />
          </span>
        </div>
      )}

      <div className="p-4 w-full">
        {/* Real-time transcription display */}
        <div className="relative w-full flex justify-center">
          {currentTranscription && (
            <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm text-muted-foreground absolute bottom-full mb-2 z-10">
              <p className="whitespace-pre-wrap break-words">
                {currentTranscription}
                {isTranscribing && (
                  <span className="ml-1 inline-block animate-pulse">▌</span>
                )}
              </p>
            </div>
          )}
        </div>

        <PromptInput onSubmit={handleSubmit} className="py-3">
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                status !== "ready"
                  ? t("thinking")
                  : isSpeaking
                  ? t("speaking")
                  : t("askAnything")
              }
              className="min-h-12 resize-none w-full rounded-md p-3 outline-none transition-colors"
              disabled={status !== "ready" || isSpeaking}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <AudioRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
                onTranscriptionUpdate={setCurrentTranscription}
                onTranscribingStateChange={setIsTranscribing}
                disabled={status !== "ready" || isSpeaking}
              />
              <div className="flex items-center space-x-2 ml-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-voice-mode"
                    checked={config?.useVoiceMode || false}
                    onCheckedChange={handleVoiceModeToggle}
                  />
                  <Label htmlFor="use-voice-mode" className="text-xs">
                    {t("useVoiceMode")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config?.useDocument || false}
                    onCheckedChange={handdleRequiredDocument}
                  />
                  <Label htmlFor="document-search" className="text-xs">
                    {t("alwaysSearchDocument")}
                  </Label>
                </div>
              </div>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input.trim() || status !== "ready" || isSpeaking}
              className="h-10 w-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground"
            />
          </PromptInputFooter>
        </PromptInput>

        <div className="flex justify-between items-center flex-wrap gap-2 mt-2">
          <div className="text-muted-foreground text-xs">{t("disclaimer")}</div>
        </div>
      </div>

      <DocumentUploadDialog
        isOpen={isPdfModalOpen}
        onOpenChange={setIsPdfModalOpen}
      />
    </div>
  );
}
