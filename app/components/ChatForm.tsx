/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Message, useChat } from "@ai-sdk/react";
import { TiDelete } from "react-icons/ti";
import { useEffect, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { IoArrowDownSharp } from "react-icons/io5";
import "highlight.js/styles/github-dark.css";
import rehypeHighlight from "rehype-highlight";
import { FaRegFaceSadCry } from "react-icons/fa6";
import {
  FaBitcoin,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaFilePdf,
  FaHammer,
  FaQuestion,
  FaShare,
  FaArrowUp,
  FaCopy,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import BarChart from "./BarChart";
import PieChart from "./PieChart";
import CryptoSummary from "./CryptoSummary";
import CryptoPriceOverview from "./CryptoPriceOverview";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import useUserConfig, { UserConfig } from "../hooks/useUserConfig";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShareUrl } from "../hooks/useShareUrl";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

// Import new components
import SuggestedPrompts from "./SuggestedPrompts";
import ToolsModal from "./ToolsModal";
import ShareChatModal from "./ShareChatModal";
import PdfManagementModal from "./PdfManagementModal";

// Import TanStack Query Hooks
import { useFetchDocuments } from "../hooks/useFetchDocuments";
import { useDocumentMutations } from "../hooks/useDocumentMutations";
import { useShareChatMutation } from "../hooks/useShareChatMutation";
import { useImageHandling, UploadedImage } from "../hooks/useImageHandling";
import { extractTextFromChildren } from "@/utils/textUtils";

const toolIcons: Record<string, React.ReactNode> = {
  generateBarChart: <FaChartBar />,
  generatePieChart: <FaChartPie />,
  getCryptoPrice: <FaBitcoin />,
  getCryptoMarketSummary: <FaChartLine />,
  askQuestion: <FaQuestion />,
};

interface ChatFormProps {
  chatId?: string;
  initialMessages?: Message[];
}

// Removed local extractTextFromChildren function

export default function ChatForm({ chatId, initialMessages }: ChatFormProps) {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { session } = useSupabaseSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // --- TanStack Query Hooks ---
  const { data: documents, isLoading: isLoadingDocuments } =
    useFetchDocuments(userId);
  const { uploadDocument, deleteDocument, toggleDocumentActive } =
    useDocumentMutations(userId);
  const { mutate: shareChat, isPending: isSharingChat } =
    useShareChatMutation(chatId);
  const {
    uploadedImages,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeImage,
    clearAllImages,
    isUploading: isUploadingImages,
  } = useImageHandling();

  const {
    config,
    isLoading: isLoadingUserConfig,
    updateConfig: mutateUserConfig,
    isUpdating: isUpdatingUserConfig,
  } = useUserConfig(userId);
  const {
    shareData,
    error: shareHookError,
    isLoading: isLoadingShareData,
  } = useShareUrl(chatId || "");

  const toolsArray = [
    {
      id: "generateBarChart",
      name: "generateBarChart",
      description: "Generate a bar chart",
      enabled: config?.generate_bar_chart_enabled ?? true,
    },
    {
      id: "generatePieChart",
      name: "generatePieChart",
      description: "Generate a pie chart",
      enabled: config?.generate_pie_chart_enabled ?? true,
    },
    {
      id: "getCryptoPrice",
      name: "getCryptoPrice",
      description: "Get the current price of a cryptocurrency",
      enabled: config?.get_crypto_price_enabled ?? true,
    },
    {
      id: "getCryptoMarketSummary",
      name: "getCryptoMarketSummary",
      description: "Get a summary of the current market for a cryptocurrency",
      enabled: config?.get_crypto_market_summary_enabled ?? true,
    },
    {
      id: "askQuestion",
      name: "askQuestion",
      description: "Ask a question about the uploaded documents",
      enabled: config?.ask_question_enabled ?? true,
    },
  ];

  const handleDocumentUpload = (file: File, title: string) => {
    uploadDocument.mutate({ file, title });
  };

  const handleDeleteDocument = (doc: any) => {
    deleteDocument.mutate({
      document_id: doc.document_id,
      document_name: doc.document_name,
      title: doc.title,
    });
  };

  const handleToggleDocumentActive = (doc: any) => {
    toggleDocumentActive.mutate({
      document_id: doc.document_id,
      currentActiveState: doc.active,
      title: doc.title,
    });
  };

  const suggestedPromptsData = [
    { title: "What is the current price of Bitcoin?", subtitle: "as of today" },
    { title: "Tell me about the document", subtitle: "Who is the author?" },
    {
      title: "Show me a bar chart",
      subtitle: "of monthly expenses by category",
    },
    {
      title: "Create a pie chart",
      subtitle: "comparing revenue from different regions",
    },
    { title: "Compare income and expenses", subtitle: "in a bar chart format" },
    {
      title: "Visualize my monthly spending",
      subtitle: "as a pie chart with colors by category",
    },
  ];

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const {
    messages,
    input,
    handleSubmit: originalHandleSubmit,
    handleInputChange,
    status,
    setInput,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: initialMessages,
    sendExtraMessageFields: true,
    body: { chatId },
    onFinish: async (response) => {
      const totalCreditCost = response.toolInvocations?.length;
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["credit", userId] });
      }
      if (totalCreditCost && totalCreditCost > 0) {
        toast.success(`Used ${totalCreditCost} credits.`);
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
    },
    onError: (error) => {
      console.error("Chat API Error:", error);
      toast.error("An error occurred with the chat API: " + error.message);
    },
  });

  const handleSubmitWithImages = async (
    e?: React.FormEvent<HTMLFormElement>,
  ) => {
    if (e) e.preventDefault();
    const messageContent = input.trim();
    const imagePublicUrls = uploadedImages
      .filter((img) => img.publicUrl)
      .map((img) => img.publicUrl as string);

    if (!messageContent && imagePublicUrls.length === 0) {
      toast.info("Please type a message or upload an image.");
      return;
    }

    const messageData: any = {};
    if (imagePublicUrls.length > 0) {
      messageData.imageUrls = imagePublicUrls;
    }

    if (imagePublicUrls.length > 0) {
      append({
        role: "user",
        content: messageContent,
        data: messageData,
      });
    } else {
      originalHandleSubmit(e || (new Event("submit") as any));
    }

    setInput("");
    clearAllImages();
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 50;
      setIsAtBottom(
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold,
      );
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
        textareaRef.current?.focus();
      }, 100);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (e.key.length === 1) textareaRef.current?.focus();
    };
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  useEffect(() => {
    if (promptToSubmit !== null) {
      setInput(promptToSubmit);
      setTimeout(() => {
        if (textareaRef.current?.form) {
          const submitEvent = new Event("submit", {
            bubbles: true,
            cancelable: true,
          });
          textareaRef.current.form.dispatchEvent(submitEvent);
        }
        setPromptToSubmit(null);
      }, 100);
    }
  }, [promptToSubmit, setInput]);

  const handlePromptClick = (text: string) => {
    textareaRef.current?.focus();
    setPromptToSubmit(text);
  };

  const handleUpdateToolConfig = (
    toolUpdates: Partial<Record<string, boolean>>,
  ) => {
    const formattedUpdates: Partial<UserConfig> = {};
    for (const [toolId, enabled] of Object.entries(toolUpdates)) {
      const key = `${toolId}_enabled` as keyof UserConfig;
      if (key in (config || {})) {
        (formattedUpdates as any)[key] = enabled;
      } else {
        console.warn(`Invalid tool config key: ${key}`);
      }
    }
    if (Object.keys(formattedUpdates).length > 0) {
      mutateUserConfig(formattedUpdates);
    } else {
      toast.info("No valid configuration changes to apply.");
    }
  };

  const handleShareChat = () => {
    if (chatId) {
      shareChat();
    } else {
      toast.error("Cannot share: Chat ID is missing.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isDesktop) {
      e.preventDefault();
      handleSubmitWithImages();
    }
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <TooltipProvider delayDuration={100}>
      <form
        className={clsx(
          "flex flex-col items-center gap-4 md:h-[calc(100dvh-70px)] justify-center h-[calc(100dvh-30px)] overflow-y-auto scroll-hidden",
          isDragging && "border-2 border-dashed border-primary bg-primary/10",
        )}
        onSubmit={handleSubmitWithImages}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messages.length === 0 && !status.startsWith("experimental") && (
          <>
            <div className="md:mt-0 mt-[100px] text-center">
              <p className="text-2xl font-bold">Hello there!</p>
              <p className="text-zinc-300">How can I help you today?</p>
            </div>
            <div className="w-full max-w-2xl max-h-[calc(100dvh-350px)] overflow-y-auto scroll-hidden px-2">
              <SuggestedPrompts
                prompts={suggestedPromptsData}
                onPromptClick={handlePromptClick}
              />
            </div>
          </>
        )}

        <div className="w-full bg-zinc-800 p-2 rounded-xl md:mt-0 mt-[40px] relative">
          {isDragging && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg pointer-events-none z-10">
              <div className="text-center p-6 bg-zinc-800 rounded-lg">
                <p className="text-xl font-medium mb-2">
                  Drop your images here
                </p>
                <p className="text-sm text-zinc-400">
                  Support for PNG, JPG, GIF (max 5 images)
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            {messages.length > 0 && chatId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <FaShare className="text-lg" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share this Chat</TooltipContent>
              </Tooltip>
            )}
          </div>
          <ScrollArea
            ref={containerRef}
            className={clsx(
              "overflow-auto scroll-hidden px-2",
              messages.length > 0 && " py-4 h-[calc(100dvh-250px)]",
            )}
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex py-2 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`text-left py-2 rounded-2xl text-sm ${isUser ? "bg-blue-600 text-white" : "text-white"} ${!isUser && !message.toolInvocations?.length && "bg-zinc-600"}`}
                  >
                    {message.data &&
                      (message.data as any).imageUrls &&
                      ((message.data as any).imageUrls as string[]).length >
                        0 && (
                        <div className="grid grid-cols-2 gap-2 p-2">
                          {((message.data as any).imageUrls as string[]).map(
                            (url: string, idx: number) => (
                              <Image
                                key={idx}
                                src={url}
                                alt={`Uploaded image ${idx + 1}`}
                                width={100}
                                height={100}
                                className="rounded-md object-cover"
                              />
                            ),
                          )}
                        </div>
                      )}
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p
                            key={index}
                            className="px-4 leading-relaxed whitespace-pre-wrap"
                          >
                            {part.text}
                          </p>
                        );
                      } else if (part.type === "tool-invocation") {
                        const toolName = part.toolInvocation.toolName;
                        const result = (part.toolInvocation as any)?.result;
                        const isStreamingTool =
                          !("result" in part.toolInvocation) &&
                          message.id === messages[messages.length - 1]?.id &&
                          status === "streaming";

                        if (isStreamingTool) {
                          return (
                            <div
                              key={`${message.id}-streaming-${index}`}
                              className="flex items-center gap-2 px-4 py-2"
                            >
                              <p className="text-white text-sm">
                                {toolName === "askQuestion"
                                  ? "Searching..."
                                  : `Generating ${toolName.replace("generate", "").toLowerCase()}...`}
                              </p>
                              <Loader2 className="animate-spin h-5 w-5 text-orange-500" />
                            </div>
                          );
                        }
                        if (!result) {
                          return (
                            <div
                              key={`${message.id}-error-${index}`}
                              className="flex items-center gap-2 px-4 py-2"
                            >
                              <p className="text-white text-sm">
                                Error with {toolName}.
                              </p>{" "}
                              <FaRegFaceSadCry />
                            </div>
                          );
                        }
                        switch (toolName) {
                          case "generatePieChart":
                            return (
                              <div key={index}>
                                <PieChart option={result?.chartData} />
                              </div>
                            );
                          case "generateBarChart":
                            return (
                              <div key={index}>
                                <BarChart option={result?.chartData} />
                              </div>
                            );
                          case "getCryptoPrice":
                            return (
                              <CryptoPriceOverview
                                key={index}
                                result={result}
                              />
                            );
                          case "getCryptoMarketSummary":
                            return <CryptoSummary key={index} data={result} />;
                          case "askQuestion":
                            return (
                              <div
                                key={index}
                                className="prose prose-sm prose-invert p-4 max-w-none"
                              >
                                <ReactMarkdown
                                  rehypePlugins={[rehypeHighlight]}
                                  components={{
                                    code({
                                      node,
                                      className,
                                      children,
                                      ...props
                                    }) {
                                      const language =
                                        className?.replace("language-", "") ??
                                        "";
                                      const codeString =
                                        extractTextFromChildren(children);
                                      return (
                                        <div className="relative group my-2">
                                          <Button
                                            variant="ghost"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                codeString,
                                              );
                                              toast.success("Copied!");
                                            }}
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                          >
                                            <FaCopy className="h-3 w-3" />
                                          </Button>
                                          <pre className="rounded-md p-3 overflow-x-auto bg-zinc-900 text-xs">
                                            <code
                                              className={`language-${language}`}
                                              {...props}
                                            >
                                              {children}
                                            </code>
                                          </pre>
                                        </div>
                                      );
                                    },
                                  }}
                                >
                                  {result}
                                </ReactMarkdown>
                              </div>
                            );
                          default:
                            return null;
                        }
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </ScrollArea>
          <div className="flex flex-col">
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="ml-2 relative"
                      size="icon"
                      onClick={() => setIsPdfModalOpen(true)}
                    >
                      <FaFilePdf className="h-5 w-5" />
                      <div className="absolute text-[10px] top-[-8px] right-[-8px] w-4 h-4 flex items-center justify-center bg-orange-500 rounded-full text-white">
                        {isLoadingDocuments ? (
                          <Loader2 className="h-2 w-2 animate-spin" />
                        ) : (
                          documents?.length || 0
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Manage PDF Documents</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="ml-2 relative"
                      size="icon"
                      onClick={() => setIsToolModalOpen(true)}
                    >
                      <FaHammer className="h-5 w-5" />
                      <div className="absolute text-[10px] top-[-8px] right-[-8px] w-4 h-4 flex items-center justify-center bg-orange-500 rounded-full text-white">
                        {toolsArray.filter((t) => t.enabled).length}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Manage Tools</TooltipContent>
                </Tooltip>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    asChild
                  >
                    <span>
                      <FaArrowUp />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileInput}
                        disabled={
                          uploadedImages.length >= 5 ||
                          status !== "ready" ||
                          isUploadingImages
                        }
                      />
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach Images (max 5)</TooltipContent>
              </Tooltip>
            </div>
            <div className="sticky bottom-0 flex-col w-full py-2 px-2 flex gap-3">
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border border-zinc-700 rounded-md bg-zinc-800/50 absolute bottom-[70px] left-2 right-2 max-w-[calc(100%-1rem)] overflow-x-auto">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group flex-shrink-0"
                    >
                      <Image
                        src={image.url}
                        alt={`Uploaded ${image.file?.name || "image"}`}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover rounded-md border border-zinc-600"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-[-8px] right-[-8px] h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(image)}
                        disabled={image.isUploading}
                      >
                        <TiDelete className="h-4 w-4" />
                      </Button>
                      {image.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                          <Loader2 className="animate-spin h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!isAtBottom && messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-10 h-10 bottom-36 fixed self-center z-10 rounded-full shadow-lg"
                  aria-label="Scroll to bottom"
                >
                  <IoArrowDownSharp />
                </Button>
              )}
              <div className="flex items-end gap-2 w-full relative">
                <Textarea
                  value={input}
                  ref={textareaRef}
                  onChange={handleInputChange}
                  placeholder={
                    status !== "ready"
                      ? "Thinking..."
                      : "Ask anything or drop images..."
                  }
                  disabled={
                    status !== "ready" ||
                    isUploadingImages ||
                    isLoadingUserConfig
                  }
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 min-h-[40px] max-h-[150px] overflow-y-auto"
                  rows={1}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  disabled={
                    status !== "ready" ||
                    (!input.trim() && uploadedImages.length === 0) ||
                    isUploadingImages ||
                    isUpdatingUserConfig
                  }
                  className="h-10 w-10 rounded-full border bg-white border-zinc-400"
                >
                  {(status === "streaming" &&
                    messages[messages.length - 1]?.role === "user") ||
                  isUpdatingUserConfig ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FaArrowUp />
                  )}
                </Button>
              </div>
            </div>

            <PdfManagementModal
              isOpen={isPdfModalOpen}
              onOpenChange={setIsPdfModalOpen}
              chatId={chatId}
              documents={documents || []}
              isLoading={isLoadingDocuments}
              onUpload={handleDocumentUpload}
              onDelete={handleDeleteDocument}
              onToggleActive={handleToggleDocumentActive}
              onClose={() => setIsPdfModalOpen(false)}
              fetchDocuments={() =>
                queryClient.invalidateQueries({
                  queryKey: ["documents", userId],
                })
              }
            />
            <ToolsModal
              isOpen={isToolModalOpen}
              onOpenChange={setIsToolModalOpen}
              tools={toolsArray}
              toolIcons={toolIcons}
              onUpdateConfig={handleUpdateToolConfig}
            />
            <ShareChatModal
              isOpen={isShareModalOpen}
              onOpenChange={setIsShareModalOpen}
              shareData={shareData}
              isLoading={isSharingChat || isLoadingShareData}
              onShare={handleShareChat}
              shareError={
                shareHookError ? { message: shareHookError.message } : null
              }
              chatId={chatId}
            />
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
