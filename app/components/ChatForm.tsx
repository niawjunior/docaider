/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Message, useChat } from "@ai-sdk/react";
import { TiDelete } from "react-icons/ti";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IoArrowDownSharp } from "react-icons/io5";
import dayjs from "dayjs";
import DocumentUpload from "./DocumentUpload";
import "highlight.js/styles/github-dark.css"; // or choose another theme
import { FaRegFaceSadCry } from "react-icons/fa6";
import { FaFilePdf, FaHammer, FaQuestion, FaShare } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import useSupabaseSession from "../hooks/useSupabaseSession";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShareUrl } from "../hooks/useShareUrl";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Markdown from "./Markdown";
import { useDocuments } from "../hooks/useDocuments";
import GlobalLoader from "./GlobalLoader";

const toolIcons = {
  askQuestion: <FaQuestion />,
};

interface ChatFormProps {
  chatId?: string;
  suggestedPrompts?: { title: string; subtitle?: string }[];
  isShowTool?: boolean;
  isKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
}

export default function ChatForm({
  chatId,
  suggestedPrompts,
  isShowTool,
  isKnowledgeBase = false,
  knowledgeBaseId,
}: ChatFormProps) {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateShareLoading, setIsCreateShareLoading] = useState(false);
  // Using the deleteDocument mutation from useDocuments hook for loading state
  const { shareData, error: shareError } = useShareUrl(chatId!);
  const queryClient = useQueryClient();
  const [isDesktop, setIsDesktop] = useState(false);
  const [currentTool, setCurrentTool] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const { session } = useSupabaseSession();
  const { useGetDocuments } = useDocuments();
  const tools = [
    {
      name: "askQuestion",
      description: "Ask a question about the uploaded documents",
    },
  ];
  const {
    data: initialMessages,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) {
        return []; // Return empty array if no chatId
      }
      const response = await fetch(
        `/api/chats/${chatId}?isKnowledgeBase=${isKnowledgeBase}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat data");
      }
      return response.json();
    },
    enabled: !!chatId, // Only run the query when chatId exists
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: false, // Don't
  });

  useEffect(() => {
    // Focus on load
    textareaRef.current?.focus();
  }, []);
  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    status,
    setInput,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: initialMessages || [],
    sendExtraMessageFields: true,

    body: {
      chatId,
      currentTool,
      isKnowledgeBase,
      knowledgeBaseId,
    },
    async onToolCall({ toolCall }) {},
    onFinish: async (response) => {
      const totalCreditCost = response.toolInvocations?.length;

      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      await queryClient.invalidateQueries({
        queryKey: ["credit", session?.user?.id],
      });
      if (totalCreditCost && totalCreditCost > 0) {
        toast.success(`Used ${totalCreditCost} credits.`);
      }

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    },
    onError: (error) => {
      console.log("onError", error);
    },
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: documents = [] } = useGetDocuments({ isKnowledgeBase });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 50; // pixels from bottom
      const isBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsAtBottom(isBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

        textareaRef.current?.focus();
      }, 100);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const active = document.activeElement;

      // If already typing in an input/textarea or using a shortcut, do nothing
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      // Ignore if non-character keys (e.g., Shift, Tab, etc.)
      if (e.key.length === 1) {
        textareaRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, []);

  useEffect(() => {
    if (promptToSubmit !== null) {
      setInput(promptToSubmit);
      setTimeout(() => {
        handleSubmit(new Event("submit"));
        setPromptToSubmit(null); // reset
      }, 100);
    }
  }, [promptToSubmit, handleSubmit, setInput]);

  const handlePromptClick = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    textareaRef.current?.focus();
    setPromptToSubmit(text);
  };

  const handleShare = async () => {
    try {
      setIsCreateShareLoading(true);
      const response = await fetch(`/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("Share link created");
      // Invalidate and refetch the share URL query
      queryClient.invalidateQueries({ queryKey: ["shareUrl", chatId] });
      setIsShareModalOpen(true);
    } catch (error) {
      console.error("Error sharing chat:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsCreateShareLoading(false);
    }
  };

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isDesktop) {
        e.preventDefault();

        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || isFetching) {
    return <GlobalLoader />;
  }
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className={clsx(
          "flex flex-col items-center gap-4  w-full  overflow-y-auto scroll-hidden"
        )}
      >
        {messages?.length === 0 && (
          <>
            <div className="md:mt-0 mt-[100px] ">
              <p className="text-2xl font-bold">Hello there!</p>
              <p className="text-zinc-300">How can I help you today?</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full max-h-[calc(100dvh-350px)] overflow-y-auto scroll-hidden px-2">
              {suggestedPrompts?.map((prompt, idx) => (
                <Button
                  variant="outline"
                  key={idx}
                  onClick={(e) => {
                    handlePromptClick(
                      e,
                      `${prompt.title} ${prompt.subtitle || ""}`
                    );
                  }}
                  className=" flex flex-col justify-center items-center gap-2 h-[70px]"
                >
                  <p className="text-sm font-semibold text-wrap">
                    {prompt.title}
                  </p>
                  <p className="text-xs text-zinc-400 text-wrap">
                    {prompt.subtitle}
                  </p>
                </Button>
              ))}
            </div>
          </>
        )}

        <div className="w-full bg-zinc-800 p-2 rounded-xl md:mt-0 mt-[10px] relative">
          {!isKnowledgeBase && (
            <div className="flex justify-end ">
              {messages.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleOpenShareModal()}
                      >
                        <FaShare className="text-lg" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share your chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          <div
            ref={containerRef}
            className={clsx(
              "overflow-auto scroll-hidden px-2",

              messages.length > 0 &&
                !isKnowledgeBase &&
                " py-4 md:h-[calc(100dvh-250px)] h-[calc(100dvh-300px)]",
              messages.length > 0 &&
                isKnowledgeBase &&
                " py-4 md:h-[calc(100dvh-490px)] h-[calc(100dvh-300px)]"
            )}
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex py-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={clsx(
                      "text-sm text-left",
                      message.toolInvocations?.length && "w-full"
                    )}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div key={index} className="">
                            <Markdown isUser={isUser} text={part.text} />
                          </div>
                        );
                      } else {
                        if (part.type === "tool-invocation") {
                          if (part.toolInvocation.toolName === "askQuestion") {
                            const result = (part.toolInvocation as any)?.result;
                            if (
                              !("result" in part.toolInvocation) &&
                              message.id ===
                                messages[messages.length - 1]?.id &&
                              status === "streaming"
                            ) {
                              return (
                                <div
                                  key={message.id}
                                  className="flex items-center gap-2"
                                >
                                  <p className="text-white text-sm">
                                    Searching through the document...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <div key={index}>
                                <Markdown isUser={isUser} text={result} />
                              </div>
                            ) : (
                              <div
                                key={message.id}
                                className="flex items-center gap-2"
                              >
                                <p className="text-white text-sm">
                                  Something went wrong. Please try again.
                                </p>

                                <FaRegFaceSadCry />
                              </div>
                            );
                          }
                        }
                      }
                    })}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
          <div className="flex flex-col">
            <div className="sticky bottom-0 flex-col w-full py-2 px-2 flex gap-3">
              {isShowTool && (
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="outline"
                            className="ml-2 relative"
                            size="icon"
                            onClick={() => setIsPdfModalOpen(true)}
                          >
                            <FaFilePdf className="h-8 w-8" />
                            <div className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-orange-500 rounded-full">
                              {documents?.length}
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Manage documents</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="outline-none">
                        <Button
                          variant="outline"
                          className="ml-2 relative"
                          size="icon"
                        >
                          <FaHammer className="h-8 w-8" />
                          <div className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-orange-500 rounded-full">
                            {tools.length}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="h-[300px] max-w-[300px]"
                        align="start"
                        side="top"
                        sideOffset={10}
                        alignOffset={-25}
                      >
                        <DropdownMenuLabel>Available tools</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {tools.map((tool) => (
                          <DropdownMenuCheckboxItem
                            key={tool.name}
                            className="flex items-center gap-2 px-2 cursor-pointer"
                            checked={currentTool === tool.name}
                            onCheckedChange={(checked) =>
                              setCurrentTool(tool.name)
                            }
                          >
                            <div className="h-8 w-8 flex items-center justify-center">
                              {toolIcons[tool.name as keyof typeof toolIcons]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium leading-none truncate">
                                {tool.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-2 ">
                                {tool.description}
                              </p>
                            </div>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {currentTool && (
                      <Button
                        onClick={() => setCurrentTool("")}
                        variant="outline"
                        className="ml-1 text-xs cursor-pointer border hover:text-white"
                      >
                        {currentTool}
                        <TiDelete className="ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!isAtBottom && (
                <button
                  onClick={() =>
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-10 h-10 bottom-36 fixed self-center  flex items-center justify-center z-10 bg-zinc-900 text-white border border-zinc-400 rounded-full p-2 hover:bg-zinc-800 transition"
                  aria-label="Scroll to bottom"
                >
                  <IoArrowDownSharp />
                </button>
              )}
              <div className="flex items-center flex-col gap-3 w-full relative">
                <Textarea
                  value={input}
                  ref={textareaRef}
                  onChange={handleInputChange}
                  placeholder={
                    status !== "ready" ? "Thinking..." : "Ask anything..."
                  }
                  disabled={status !== "ready"}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-zinc-900 text-white px-4 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
                <div className=" text-muted-foreground text-sm">
                  Docaider can make mistakes. Check important info.
                </div>
              </div>
            </div>

            <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Knowledge Base </DialogTitle>
                </DialogHeader>
                <DocumentUpload
                  onClose={() => {
                    setIsPdfModalOpen(false);
                  }}
                  isShowDocumentList={true}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share public link to chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 flex flex-col items-center">
                  {shareData?.shareUrl ? (
                    <>
                      <p className="text-sm self-start text-muted-foreground">
                        {dayjs(shareData.createdAt).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )}
                      </p>
                      <div className="flex items-center gap-2 justify-between w-full">
                        <input
                          type="text"
                          value={shareData.shareUrl}
                          readOnly
                          className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(shareData.shareUrl);
                            toast.success("Link copied to clipboard");
                          }}
                        >
                          Copy Link
                        </Button>
                      </div>
                      <Button
                        disabled={isCreateShareLoading}
                        className="w-full"
                        onClick={handleShare}
                      >
                        {isCreateShareLoading
                          ? "Updating..."
                          : "Update Share Link"}
                        {isCreateShareLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                      <p className="text-sm text-gray-400">
                        Share this link with anyone to let them view your chat
                        in read-only mode.
                      </p>
                    </>
                  ) : (
                    <Button
                      disabled={isCreateShareLoading}
                      className="w-full"
                      onClick={handleShare}
                    >
                      {isCreateShareLoading
                        ? "Generating..."
                        : "Generate Share Link"}
                      {isCreateShareLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                    </Button>
                  )}
                  {shareError && (
                    <p className="text-sm text-red-400 mt-2">
                      {shareError.message}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </form>
    </>
  );
}
