"use client";

import { Message, useChat } from "@ai-sdk/react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { IoArrowDownSharp } from "react-icons/io5";
import dayjs from "dayjs";
import DocumentUpload from "./DocumentUpload";
import {
  FaBitcoin,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaFilePdf,
  FaHammer,
  FaQuestion,
  FaShare,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import BarChart from "./BarChart";
import PieChart from "./PieChart";
import GlobalLoader from "./GlobalLoader";
import CryptoSummary from "./CryptoSummary";
import CryptoPriceOverview from "./CryptoPriceOverview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import useUserConfig, { UserConfig } from "../hooks/useUserConfig";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { useCredit } from "../context/CreditContext";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useShareUrl } from "../hooks/useShareUrl";
import { Loader2 } from "lucide-react";

const toolIcons = {
  generateBarChart: <FaChartBar />,
  generatePieChart: <FaChartPie />,
  getCryptoPrice: <FaBitcoin />,
  getCryptoMarketSummary: <FaChartLine />,
  askQuestion: <FaQuestion />,
};

interface ChatFormProps {
  chatId?: string;
  onChatUpdate?: () => void;
}

export default function ChatForm({ chatId, onChatUpdate }: ChatFormProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateShareLoading, setIsCreateShareLoading] = useState(false);
  const { shareData, error: shareError, refresh } = useShareUrl(chatId!);
  const [documents, setDocuments] = useState<
    {
      title: string;
      created_at: string;
      url: string;
      id: string;
      active: boolean;
      document_id: string;
      document_name: string;
    }[]
  >([]);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { session } = useSupabaseSession();
  const { config, updateConfig } = useUserConfig(session?.user?.id || "");
  const { credit, updateCredit } = useCredit();

  const tools = [
    {
      name: "generateBarChart",
      description: "Generate a bar chart",
      enabled: config?.generate_bar_chart_enabled ?? true,
      creditCost: 1,
    },
    {
      name: "generatePieChart",
      description: "Generate a pie chart",
      enabled: config?.generate_pie_chart_enabled ?? true,
      creditCost: 1,
    },
    {
      name: "getCryptoPrice",
      description: "Get the current price of a cryptocurrency",
      enabled: config?.get_crypto_price_enabled ?? true,
      creditCost: 1,
    },
    {
      name: "getCryptoMarketSummary",
      description: "Get a summary of the current market for a cryptocurrency",
      enabled: config?.get_crypto_market_summary_enabled ?? true,
      creditCost: 1,
    },
    {
      name: "askQuestion",
      description: "Ask a question about the uploaded documents",
      enabled: config?.ask_question_enabled ?? true,
      creditCost: 2,
    },
  ];

  const handleDocumentUpload = async (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        toast("Error uploading document", {
          duration: 5000,
          description: "Failed to upload document. Please try again.",
        });
      } else {
        toast("Document uploaded successfully", {
          duration: 5000,
          description: "Document uploaded successfully.",
        });
        updateCredit((credit?.balance || 0) - 1);
      }
    } catch {
      toast("Error uploading document", {
        duration: 5000,
        description: "Failed to upload document. Please try again.",
      });
    }
  };

  const suggestedPrompts = [
    {
      title: "What is the current price of Bitcoin?",
      subtitle: "as of today",
    },
    {
      title: "Tell me about the document",
      subtitle: "Who is the author?",
    },
    {
      title: "Show me a bar chart",
      subtitle: "of monthly expenses by category",
    },
    {
      title: "Create a pie chart",
      subtitle: "comparing revenue from different regions",
    },
    {
      title: "Compare income and expenses",
      subtitle: "in a bar chart format",
    },
    {
      title: "Visualize my monthly spending",
      subtitle: "as a pie chart with colors by category",
    },
  ];

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
    initialMessages: currentMessages,
    sendExtraMessageFields: true,
    body: {
      chatId,
    },
    async onToolCall({ toolCall }) {
      // Find the tool configuration
      const tool = tools.find((t) => t.name === toolCall.toolName);
      if (!tool || !tool.creditCost) {
        console.error(
          "Tool not found or missing credit cost:",
          toolCall.toolName
        );
        return;
      }

      // Check if user has credits data and enough credits
      if (
        !credit ||
        credit.balance === undefined ||
        credit.balance < tool.creditCost
      ) {
        toast.error(
          `Not enough credits. You need ${tool.creditCost} credits for this action.`
        );
        return;
      }

      // Deduct credits
      try {
        await updateCredit(credit.balance - tool.creditCost);
        toast.success(
          `Used ${tool.creditCost} credits. Remaining: ${
            credit.balance - tool.creditCost
          }`
        );
      } catch (error) {
        console.error("Error updating credits:", error);
        toast.error("Failed to update credits. Please try again.");
        return;
      }
    },
    onFinish: async () => {
      setCurrentMessages(messages);
      onChatUpdate?.();

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    },
    onError: (error) => {
      console.log("onError", error);
    },
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (chatId) {
      fetch(`/api/chats/${chatId}`)
        .then((res) => res.json())
        .then((data) => {
          // The useChat hook doesn't provide a way to set initial messages directly,
          // so we'll need to trigger a new message with the existing history
          if (Array.isArray(data)) {
            setCurrentMessages(data);
            setMessages(data);
            setIsLoading(false);
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        })
        .catch((error) => console.error("Error loading chat history:", error))
        .finally(() => {
          setIsLoading(false);
          setIsReady(true);
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 100);
        });
    }
  }, [chatId, setMessages, router]);

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

  const handlePromptClick = (text: string) => {
    textareaRef.current?.focus();
    setPromptToSubmit(text);
  };

  const fetchDocuments = async () => {
    try {
      const supabase = await createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      // Get all files in the user's directory
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.user.id);
      if (error) throw error;

      // Get public URLs for each file
      const documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          const { data: publicUrl } = await supabase.storage
            .from("documents")
            .getPublicUrl(`user_${user.user.id}/${doc.document_name}`);
          return {
            title: doc.title,
            created_at: doc.created_at || new Date().toISOString(),
            url: publicUrl.publicUrl,
            id: doc.id,
            active: doc.active,
            document_id: doc.document_id,
            document_name: doc.document_name,
          };
        })
      );

      setDocuments(documentsWithUrls);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast("Error fetching documents", {
        duration: 5000,
        description: "Failed to fetch your documents. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (doc: {
    title: string;
    url: string;
    id: string;
    document_id: string;
    document_name: string;
  }) => {
    try {
      const supabase = await createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user?.id) return;
      // // Delete the file from storage
      const { error } = await supabase.storage
        .from("documents")
        .remove([`user_${user.user.id}/${doc.document_name}`]);

      if (error) throw error;

      // // // Delete the document from the database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      // // Remove the document from the state
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast("Document deleted successfully", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast("Error deleting document", {
        duration: 5000,
        description: "Failed to delete document. Please try again.",
      });
    }
  };

  const handleToggleDocumentActive = async (doc: {
    id: string;
    active: boolean;
  }) => {
    try {
      const supabase = await createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user?.id) return;

      const { error } = await supabase
        .from("documents")
        .update({ active: !doc.active })
        .eq("id", doc.id);

      if (error) throw error;

      // Update the local state
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, active: !doc.active } : d))
      );

      toast(
        `Document ${doc.active ? "deactivated" : "activated"} successfully`,
        {
          duration: 3000,
          description: doc.active
            ? "The document has been deactivated and will not be used in searches."
            : "The document has been activated and will be used in searches.",
        }
      );
    } catch (error) {
      console.error("Error toggling document status:", error);
      toast("Error toggling document status", {
        duration: 5000,
        description: "Failed to toggle document status. Please try again.",
      });
    }
  };

  const handleUpdateConfig = async (
    updates: Partial<Record<string, boolean>>
  ) => {
    const mappedUpdates: Partial<UserConfig> = {};

    Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case "generateBarChart":
          mappedUpdates.generate_bar_chart_enabled = value;
          break;
        case "generatePieChart":
          mappedUpdates.generate_pie_chart_enabled = value;
          break;
        case "getCryptoPrice":
          mappedUpdates.get_crypto_price_enabled = value;
          break;
        case "getCryptoMarketSummary":
          mappedUpdates.get_crypto_market_summary_enabled = value;
          break;
        case "askQuestion":
          mappedUpdates.ask_question_enabled = value;
          break;
      }
    });

    await updateConfig(mappedUpdates);
    toast.success("Config updated successfully", {
      duration: 3000,
    });
  };

  const handleShare = async () => {
    try {
      setIsCreateShareLoading(true);
      const response = await fetch(`/api/share/${chatId}`, {
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
      setIsShareModalOpen(true);
      refresh();
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

  return (
    <>
      <div className="flex flex-col items-center gap-4 ">
        {!isReady && <GlobalLoader />}
        {messages.length === 0 && !isLoading && (
          <>
            <div className="md:mt-0 mt-[100px] ">
              <p className="text-2xl font-bold">Hello there!</p>
              <p className="text-zinc-300">How can I help you today?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl max-h-[calc(100dvh-350px)] overflow-y-auto scroll-hidden px-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handlePromptClick(`${prompt.title} ${prompt.subtitle}`)
                  }
                  className="text-left px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
                >
                  <p className="font-semibold text-white">{prompt.title}</p>
                  <p className="text-sm text-zinc-400">{prompt.subtitle}</p>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="w-full bg-zinc-800 p-2 rounded-xl md:mt-0 mt-[40px]">
          <div className="flex justify-end">
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
          <div
            ref={containerRef}
            className={clsx(
              "overflow-auto scroll-hidden px-2",

              messages.length > 0 && " py-4 h-[calc(100dvh-250px)]"
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
                    className={` text-left py-2 rounded-2xl text-sm ${
                      isUser ? "bg-blue-600 text-white" : " text-white"
                    } ${
                      !isUser &&
                      !message.toolInvocations?.length &&
                      "bg-zinc-600"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p
                            key={index}
                            className=" px-4 leading-relaxed whitespace-pre-wrap"
                          >
                            {part.text}
                          </p>
                        );
                      } else {
                        if (part.type === "tool-invocation") {
                          if (
                            part.toolInvocation.toolName === "generatePieChart"
                          ) {
                            const result = (part.toolInvocation as any)?.result;

                            return (
                              <div key={index}>
                                <PieChart option={result?.chartData} />
                              </div>
                            );
                          }

                          if (
                            part.toolInvocation.toolName === "generateBarChart"
                          ) {
                            const result = (part.toolInvocation as any)?.result;
                            return (
                              <div key={index}>
                                <BarChart option={result?.chartData} />
                              </div>
                            );
                          }

                          if (
                            part.toolInvocation.toolName === "getCryptoPrice"
                          ) {
                            const result = (part.toolInvocation as any)?.result;
                            return (
                              <CryptoPriceOverview
                                key={index}
                                result={result}
                              />
                            );
                          }

                          if (
                            part.toolInvocation.toolName ===
                            "getCryptoMarketSummary"
                          ) {
                            const result = (part.toolInvocation as any)?.result;

                            return <CryptoSummary key={index} data={result} />;
                          }

                          if (part.toolInvocation.toolName === "askQuestion") {
                            const result = (part.toolInvocation as any)?.result;

                            return result ? (
                              <div>
                                <ReactMarkdown
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-xl font-bold mb-4 text-white">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-lg font-semibold mb-3 text-white">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-base font-medium mb-2 text-white">
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-4 text-white">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc pl-6 mb-4 text-white">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal pl-6 mb-4 text-white">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="mb-2 text-white">
                                        {children}
                                      </li>
                                    ),

                                    strong: ({ children }) => (
                                      <strong className="font-bold text-white">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-white">
                                        {children}
                                      </em>
                                    ),
                                  }}
                                >
                                  {result}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-white text-sm">
                                  Searching through documents...
                                </p>
                                <div className="flex items-center justify-center py-4">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
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
            <div className="flex justify-between items-center">
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

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        className="ml-2 relative"
                        size="icon"
                        onClick={() => setIsToolModalOpen(true)}
                      >
                        <FaHammer className="h-8 w-8" />
                        <div className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-orange-500 rounded-full">
                          {tools.length}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage tools</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="sticky bottom-0 flex-col w-full py-2 px-2 flex items-center gap-3"
            >
              {!isAtBottom && (
                <button
                  onClick={() =>
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-10 h-10 bottom-36 fixed  flex items-center justify-center z-10 bg-zinc-900 text-white border border-zinc-400 rounded-full p-2 hover:bg-zinc-800 transition"
                  aria-label="Scroll to bottom"
                >
                  <IoArrowDownSharp />
                </button>
              )}
              <div className="flex items-center gap-3 w-full">
                <textarea
                  value={input}
                  ref={textareaRef}
                  onChange={handleInputChange}
                  placeholder={
                    status !== "ready" ? "Thinking..." : "Ask anything..."
                  }
                  disabled={status !== "ready"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  rows={1}
                  className="flex-1 bg-zinc-900 text-white px-4 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
              </div>
            </form>

            <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Knowledge Base </DialogTitle>
                </DialogHeader>
                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  onDelete={handleDeleteDocument}
                  onToggleActive={handleToggleDocumentActive}
                  onClose={() => {
                    setIsPdfModalOpen(false);
                    fetchDocuments();
                  }}
                  documents={documents}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isToolModalOpen} onOpenChange={setIsToolModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Available Tools</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] overflow-y-auto">
                  {tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {toolIcons[tool.name as keyof typeof toolIcons]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium leading-none truncate">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {tool.description}
                        </p>
                        <p className="text-sm text-orange-400">
                          <Badge variant="secondary" className="text-green-500">
                            {tool.creditCost}{" "}
                            {tool.creditCost > 1 ? "credits" : "credit"}
                          </Badge>
                        </p>
                      </div>

                      <Switch
                        id={tool.name}
                        key={tool.name}
                        checked={tool.enabled}
                        onCheckedChange={(checked) =>
                          handleUpdateConfig({ [tool.name]: checked })
                        }
                      />
                    </div>
                  ))}
                </ScrollArea>
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
      </div>
    </>
  );
}
