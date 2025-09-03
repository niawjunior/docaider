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

// Import our new subcomponents
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import ShareDialog from "./chat/ShareDialog";
import DocumentUploadDialog from "./chat/DocumentUploadDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaShare } from "react-icons/fa";
import useUserConfig from "../hooks/useUserConfig";

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const queryClient = useQueryClient();
  // isAtBottom state is now handled in ChatMessages
  const containerRef = useRef<HTMLDivElement>(null);
  const { session } = useSupabaseSession();
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
  const [isUseVoiceMode, setIsUseVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
      const totalCreditCost = toolCalls.length;
      onFinished?.();
      await queryClient.invalidateQueries({
        queryKey: ["credit", session?.user?.id],
      });

      if (!isKnowledgeBase) {
        await queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      }
      if (totalCreditCost > 0) {
        toast.success(`Used ${totalCreditCost} credits.`);
      }

      // Get the last message text for text-to-speech
      const lastMessage: any = message.parts?.[message.parts?.length - 1];
      const messageText = lastMessage?.text;

      // Use the state directly instead of checking DOM
      if (isUseVoiceMode && messageText) {
        handleTextToSpeech(messageText);
      }
    },
    onError: (error) => {
      console.log("onError", error);
      toast.error(error.message);
    },
  });

  // Use the hook to get and update user config
  const {
    config,
    updateConfig,
    loading: configSaving,
    isUpdating: configUpdating,
  } = useUserConfig(session?.user?.id || "");

  const handleSubmit = useCallback(() => {
    // Get the current input value directly from state to ensure we have the latest value
    const currentInput = input;
    if (!currentInput.trim() || configSaving || configUpdating) return;
    sendMessage({ text: currentInput });
    setInput("");
  }, [input, configSaving, configUpdating, sendMessage]);

  const handleTextToSpeech = async (text: string) => {
    if (!text) return;

    setIsSpeaking(true);
    toast.info(t("speaking"));

    try {
      // Initialize Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: "coral",
          model: "gpt-4o-mini-tts",
          streaming: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      // Store chunks to combine them later
      const chunks: Uint8Array[] = [];
      
      // Read stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        chunks.push(value);
      }

      // Combine all chunks into a single array
      let totalLength = 0;
      chunks.forEach(chunk => {
        totalLength += chunk.length;
      });
      
      const combinedChunks = new Uint8Array(totalLength);
      
      let offset = 0;
      chunks.forEach(chunk => {
        combinedChunks.set(chunk, offset);
        offset += chunk.length;
      });

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(
        combinedChunks.buffer
      );

      // Create and start audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Handle completion
      source.onended = () => {
        setIsSpeaking(false);
      };
      
      // Start playing
      source.start(0);

    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio");
      setIsSpeaking(false);
    }
  };

  const handdleRequiredDocument = async () => {
    // Update user config
    await updateConfig({
      useDocument: !config?.useDocument,
    });
    toast.success(settingsT("saveSuccess"));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [initialMessages, setMessages]);

  // Scroll event listener is now handled in ChatMessages

  // Only show the global loader for non-knowledge base chats when loading initial data
  if ((isLoading || isFetching) && !isKnowledgeBase && !messages.length) {
    return <GlobalLoader />;
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className={clsx(
          "flex flex-col items-center gap-4 w-full overflow-y-auto scroll-hidden bottom-[20px]"
        )}
      >
        <div className="w-full dark:md:bg-zinc-800 bg-transparent p-2 rounded-xl ">
          <div className="flex justify-end">
            {!isKnowledgeBase && messages.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <FaShare className="text-lg" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("shareChat")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div
            ref={containerRef}
            className={clsx("overflow-auto scroll-hidden md:px-2 px-0")}
          >
            <ChatMessages
              messages={messages}
              status={status}
              bottomRef={bottomRef}
              loading={isFetching || isLoading}
              error={error?.message}
            />
          </div>

          <div className="flex flex-col">
            <div className="sticky bottom-0 flex-col w-full py-2 px-2 flex gap-3">
              <ChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                status={status}
                isRequiredDocument={config?.useDocument || false}
                setIsRequiredDocument={handdleRequiredDocument}
                isUseVoiceMode={isUseVoiceMode}
                setIsUseVoiceMode={setIsUseVoiceMode}
                isSpeaking={isSpeaking}
                error={error?.message}
              />
            </div>

            <DocumentUploadDialog
              isOpen={isPdfModalOpen}
              onOpenChange={setIsPdfModalOpen}
            />

            {chatId && (
              <ShareDialog
                chatId={chatId}
                isOpen={isShareModalOpen}
                onOpenChange={setIsShareModalOpen}
              />
            )}
          </div>
        </div>
      </form>
    </>
  );
}
