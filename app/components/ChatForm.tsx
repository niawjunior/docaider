"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { IoArrowDownSharp } from "react-icons/io5";
import DocumentUpload from "./DocumentUpload";
import { FaFilePdf, FaHammer } from "react-icons/fa";

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

interface ChatFormProps {
  chatId?: string;
  onChatUpdate?: () => void;
}

export default function ChatForm({ chatId, onChatUpdate }: ChatFormProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [documents, setDocuments] = useState<
    {
      name: string;
      created_at: string;
      url: string;
      id: string;
      active: boolean;
      document_id: string;
      document_name: string;
    }[]
  >([]);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleDocumentUpload = async (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const response = await fetch("/api/pdf", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("result", result);
  };

  const suggestedPrompts = [
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
      console.log("toolCall", toolCall);
      if (toolCall.toolName === "visualizeData") {
      }

      if (toolCall.toolName === "askQuestion") {
      }
    },
    onFinish: async () => {
      setCurrentMessages(messages);
      onChatUpdate?.();

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      console.log("onFinish", messages);
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
            console.log("data", data);
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
            name: doc.document_name,
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
    name: string;
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
  return (
    <>
      <div className="flex flex-col items-center gap-4 ">
        {!isReady && <GlobalLoader />}
        {messages.length === 0 && !isLoading && (
          <>
            <div>
              <p className="text-2xl font-bold mb-2">Hello there!</p>
              <p className="text-zinc-300">How can I help you today?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handlePromptClick(`${prompt.title} ${prompt.subtitle}`)
                  }
                  className="text-left p-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
                >
                  <p className="font-semibold text-white">{prompt.title}</p>
                  <p className="text-sm text-zinc-400">{prompt.subtitle}</p>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="w-full bg-zinc-800 p-2 rounded-xl">
          <div
            ref={containerRef}
            className={clsx(
              "overflow-auto scroll-hidden px-2",

              messages.length > 0 && " py-4 h-[calc(100dvh-200px)]"
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
                              <p key={index}>{result}</p>
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
            <div className="flex gap-2">
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

              <Button
                onClick={() => setIsToolModalOpen(true)}
                variant="outline"
                className="ml-2 relative"
                size="icon"
              >
                <FaHammer className="h-8 w-8" />
                <div className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-orange-500 rounded-full">
                  6
                </div>
              </Button>
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
                <div>
                  <p>Generate Bar Chart</p>
                  <p>Generate Pie Chart</p>
                  <p>Get Crypto Price</p>
                  <p>Get Crypto Market Summary</p>
                  <p>Ask Question</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}
