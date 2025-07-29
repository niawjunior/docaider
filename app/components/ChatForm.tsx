"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { useDocuments } from "../hooks/useDocuments";
import { useTranslations } from "next-intl";

// Import our new subcomponents
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import ChatToolbar from "./chat/ChatToolbar";
import ShareDialog from "./chat/ShareDialog";
import DocumentUploadDialog from "./chat/DocumentUploadDialog";
import EmptyStatePrompts from "./chat/EmptyStatePrompts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaShare } from "react-icons/fa";

interface ChatFormProps {
  chatId?: string;
  suggestedPrompts?: { title: string; subtitle?: string }[];
  isShowTool?: boolean;
  isKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
  onFinished?: () => void;
}

export default function ChatForm({
  chatId,
  suggestedPrompts,
  isShowTool,
  isKnowledgeBase = false,
  knowledgeBaseId,
  onFinished,
}: ChatFormProps) {
  const t = useTranslations("chat");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [currentTool, setCurrentTool] = useState<string>("");
  // isAtBottom state is now handled in ChatMessages
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const { session } = useSupabaseSession();
  const { useGetDocuments } = useDocuments();
  const [isRequiredDocument, setIsRequiredDocument] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: initialMessages } = useQuery({
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

  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        chatId,
        currentTool: isRequiredDocument ? "askQuestion" : currentTool,
        isKnowledgeBase,
        knowledgeBaseId,
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
      if (totalCreditCost > 0) {
        toast.success(`Used ${totalCreditCost} credits.`);
      }
    },
    onError: (error) => {
      console.log("onError", error);
    },
  });

  const handleSubmit = useCallback(() => {
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  }, [input, status, sendMessage]);

  const { data: documents = [] } = useGetDocuments({ isKnowledgeBase });

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

  useEffect(() => {
    if (promptToSubmit !== null) {
      setInput(promptToSubmit);
      setTimeout(() => {
        handleSubmit();
        setPromptToSubmit(null);
      }, 100);
    }
  }, [promptToSubmit, handleSubmit]);

  const handlePromptClick = (text: string) => {
    setPromptToSubmit(text);
  };

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
        {messages?.length === 0 && (
          <EmptyStatePrompts
            suggestedPrompts={suggestedPrompts}
            onPromptClick={handlePromptClick}
          />
        )}

        <div className="w-full md:bg-zinc-800 bg-transparent p-2 rounded-xl ">
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
              isKnowledgeBase={isKnowledgeBase}
            />
          </div>

          <div className="flex flex-col">
            <div className="sticky bottom-0 flex-col w-full py-2 px-2 flex gap-3">
              <ChatToolbar
                isShowTool={isShowTool}
                messages={messages}
                documents={documents}
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                onOpenPdfModal={() => setIsPdfModalOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                isKnowledgeBase={isKnowledgeBase}
              />
              <ChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                status={status}
                isShowTool={isShowTool}
                isRequiredDocument={isRequiredDocument}
                setIsRequiredDocument={setIsRequiredDocument}
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
