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
  FaTrash,
  FaVolumeUp,
  FaSearch,
  FaCloud,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import BarChart from "./BarChart";
import PieChart from "./PieChart";
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
import useUserConfig from "../hooks/useUserConfig";
import useSupabaseSession from "../hooks/useSupabaseSession";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useShareUrl } from "../hooks/useShareUrl";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import TableComponent from "./Table";
import WebSearchComponent from "./WebSearch";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WeatherComponent from "./WeatherComponent";
import Markdown from "./Markdown";

const toolIcons = {
  generateBarChart: <FaChartBar />,
  generatePieChart: <FaChartPie />,
  getCryptoPrice: <FaBitcoin />,
  getCryptoMarketSummary: <FaChartLine />,
  askQuestion: <FaQuestion />,
  generateTTS: <FaVolumeUp />,
  webSearch: <FaSearch />,
  weather: <FaCloud />,
};

interface ChatFormProps {
  chatId?: string;
  initialMessages?: Message[];
}

interface UploadedImage {
  url: string;
  file: File;
  isUploading: boolean;
  uploadProgress: number;
  publicUrl?: string;
}

export default function ChatForm({ chatId, initialMessages }: ChatFormProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateShareLoading, setIsCreateShareLoading] = useState(false);
  const { shareData, error: shareError, refresh } = useShareUrl(chatId!);
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDeleteImageLoading, setIsDeleteImageLoading] = useState(false);
  const [isUploadImageLoading, setIsUploadImageLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [currentTool, setCurrentTool] = useState<string>("");
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const { session } = useSupabaseSession();

  const tools = [
    {
      name: "webSearch",
      description:
        "Search the web for current, external information from the internet",
    },
    {
      name: "askQuestion",
      description: "Ask a question about the uploaded documents",
    },
    {
      name: "generateTTS",
      description: "Generate a text to speech, e.g. for podcasting",
    },
    {
      name: "weather",
      description: "Get the current weather",
    },
    {
      name: "generateBarChart",
      description: "Generate a bar chart",
    },
    {
      name: "generatePieChart",
      description: "Generate a pie chart",
    },
    {
      name: "getCryptoPrice",
      description: "Get the current price of a cryptocurrency",
    },
    {
      name: "getCryptoMarketSummary",
      description: "Get a summary of the current market for a cryptocurrency",
    },
  ];

  // Add this function to handle image load
  const handleImageLoad = (messageId: string, index: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [`${messageId}-${index}`]: true,
    }));
  };

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
          description: "You have used 1 credit.",
        });

        // refresh credit
        await queryClient.invalidateQueries({
          queryKey: ["credit", session?.user?.id],
        });
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
      title: "Create a podcast script about the ghost story",
      subtitle: "with one speaker",
    },
    {
      title: "What is the latest news in Thailand?",
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
    {
      title: "How to write a book?",
      subtitle: "about ghost story",
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
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: initialMessages,
    sendExtraMessageFields: true,
    body: {
      chatId,
      currentTool,
    },
    async onToolCall({ toolCall }) {
      // // Check if user has credits data and enough credits
      // if (
      //   !credit ||
      //   credit.balance === undefined ||
      //   credit.balance < tool.creditCost
      // ) {
      //   toast.error(
      //     `Not enough credits. You need ${tool.creditCost} credits for this action.`
      //   );
      //   return;
      // }
    },
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
        if (!isUploadImageLoading) {
          handleSubmit(new Event("submit"));
          setPromptToSubmit(null); // reset
          // clear images
          setUploadedImages([]);
        }
      }, 100);
    }
  }, [promptToSubmit, handleSubmit, setInput, isUploadImageLoading]);

  const handlePromptClick = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
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

      // Step 2: Group by document_id
      const grouped = new Map<string, typeof documents>();

      documents.forEach((doc) => {
        if (!grouped.has(doc.document_id)) {
          grouped.set(doc.document_id, doc);
        }
      });

      // Get public URLs for each file
      const documentsWithUrls = await Promise.all(
        Array.from(grouped.values()).map(async (doc: any) => {
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

      // 1. Delete the file from Supabase storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([`user_${user.user.id}/${doc.document_name}`]);

      if (storageError) throw storageError;

      // 2. Delete all chunks with the same document_id
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("document_id", doc.document_id);

      if (dbError) throw dbError;

      // 3. Remove the document from local state (filter by document_id)
      setDocuments((prev) =>
        prev.filter((d) => d.document_id !== doc.document_id)
      );

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isDesktop) {
        e.preventDefault();
        if (!isUploadImageLoading) {
          console.log("input", input);
          console.log("uploadedImages", uploadedImages);

          if (uploadedImages.length > 0 && input) {
            handleSubmit(e as unknown as React.FormEvent, {
              experimental_attachments: uploadedImages.map((img) => ({
                name: img.file.name,
                contentType: img.file.type,
                url: img.publicUrl!,
              })),
            });
            // clear images
            setUploadedImages([]);
          } else {
            // if (currentTool) {
            //   append({
            //     role: "user",
            //     content: `${input} use ${currentTool}`,
            //   });
            // }
            handleSubmit(e as unknown as React.FormEvent);
          }
        }
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

  // Add these new handlers
  const handleDragOver = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast("Please upload image files only");
      return;
    }

    const newImages = imageFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isUploading: false,
      uploadProgress: 0,
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);

    // Start uploading the new images
    newImages.forEach((image, index) => {
      const globalIndex = uploadedImages.length + index;
      uploadImage(globalIndex, image.file);
    });
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];

    // If the image was successfully uploaded to Supabase, delete it
    if (imageToRemove.publicUrl) {
      setIsDeleteImageLoading(true);
      try {
        const supabase = await createClient();
        // Extract the file path from the public URL
        const filePath = imageToRemove.publicUrl.split("/").pop();
        if (filePath) {
          // Delete the file from Supabase storage
          const { error } = await supabase.storage
            .from("chat-images")
            .remove([filePath]);

          if (error) {
            console.error("Error deleting image:", error);
            toast.error("Failed to delete image from storage");
            return;
          }
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete image");
        return;
      } finally {
        setIsDeleteImageLoading(false);
      }
    }
    // Remove the image from the UI
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the object URL to prevent memory leaks
    if (imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}-${Date.now()}.${fileExt}`;
    const supabase = await createClient();
    setIsUploadImageLoading(true);
    const { data, error } = await supabase.storage
      .from("chat-images") // Replace with your Supabase bucket name
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }

    setIsUploadImageLoading(false);
    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadImage = async (index: number, file: File) => {
    try {
      // Update state to show loading
      setUploadedImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isUploading: true, uploadProgress: 0 } : img
        )
      );

      const publicUrl = await uploadImageToSupabase(file);

      // Update state with the public URL
      setUploadedImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isUploading: false, publicUrl } : img
        )
      );
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadedImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isUploading: false } : img
        )
      );
      toast.error("Failed to upload image");
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className={clsx(
          "flex flex-col items-center gap-4 md:h-[calc(100dvh-60px)] md:mt-0 mt-[50px] justify-center h-[calc(100dvh-100px)] overflow-y-auto scroll-hidden"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messages.length === 0 && (
          <>
            <div className="md:mt-0 mt-[100px] ">
              <p className="text-2xl font-bold">Hello there!</p>
              <p className="text-zinc-300">How can I help you today?</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full max-h-[calc(100dvh-350px)] overflow-y-auto scroll-hidden px-2">
              {suggestedPrompts.map((prompt, idx) => (
                <Button
                  variant="outline"
                  key={idx}
                  onClick={(e) => {
                    handlePromptClick(e, `${prompt.title} ${prompt.subtitle}`);
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
          {/* Add drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg pointer-events-none z-10">
              <div className="text-center p-6 bg-zinc-800 rounded-lg">
                <p className="text-xl font-medium mb-2">
                  Drop your images here
                </p>
                <p className="text-sm text-zinc-400">
                  Support for PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          )}
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
          <div
            ref={containerRef}
            className={clsx(
              "overflow-auto scroll-hidden px-2",

              messages.length > 0 &&
                " py-4 md:h-[calc(100dvh-250px)] h-[calc(100dvh-300px)]"
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
                    {message.experimental_attachments
                      ?.filter((attachment) =>
                        attachment.contentType?.startsWith("image/")
                      )
                      .map((attachment, index) => {
                        const imageKey = `${message.id}-${index}`;
                        const isLoaded = loadedImages[imageKey];

                        return (
                          <div key={imageKey} className="relative">
                            <Image
                              loading="lazy"
                              width={200}
                              height={200}
                              className={`rounded-lg p-2 object-cover w-[200px] h-[200px] transition-opacity duration-300 ${
                                isLoaded ? "opacity-100" : "opacity-0 absolute"
                              }`}
                              onClick={() =>
                                setSelectedImage({
                                  url: attachment.url,
                                  name: attachment.name || "Image Preview",
                                })
                              }
                              onLoad={() => handleImageLoad(message.id, index)}
                              src={attachment.url}
                              alt={attachment.name || "Uploaded image"}
                            />
                          </div>
                        );
                      })}

                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div key={index} className="">
                            <Markdown isUser={isUser} text={part.text} />
                          </div>
                        );
                      } else {
                        if (part.type === "tool-invocation") {
                          if (
                            part.toolInvocation.toolName === "generatePieChart"
                          ) {
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
                                    Generating chart...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <div key={index}>
                                <PieChart option={result?.chartData} />
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

                          if (
                            part.toolInvocation.toolName === "generateBarChart"
                          ) {
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
                                    Generating chart...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <div key={index}>
                                <BarChart option={result?.chartData} />
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

                          if (
                            part.toolInvocation.toolName === "getCryptoPrice"
                          ) {
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
                                    Fetching crypto price...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <CryptoPriceOverview
                                key={index}
                                result={result}
                              />
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

                          if (
                            part.toolInvocation.toolName ===
                            "getCryptoMarketSummary"
                          ) {
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
                                    Fetching crypto market summary ...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <CryptoSummary key={index} data={result} />
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

                          if (part.toolInvocation.toolName === "generateTTS") {
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
                                    Creating audio ...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <audio key={message.id} src={result} controls />
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

                          if (part.toolInvocation.toolName === "allDocument") {
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
                                    Fetching documents ...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <TableComponent
                                key={message.id}
                                title={result.title}
                                rows={result.rows}
                              />
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

                          if (part.toolInvocation.toolName === "webSearch") {
                            const result = (part.toolInvocation as any)?.result;
                            const query = (part.toolInvocation as any)?.args
                              ?.query;
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
                                    Searching the web ...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result ? (
                              <WebSearchComponent
                                key={message.id}
                                searchResults={result}
                                query={query}
                              />
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

                          if (part.toolInvocation.toolName === "weather") {
                            const result = (part.toolInvocation as any)?.result;
                            const query = (part.toolInvocation as any)?.args
                              ?.location;
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
                                    Fetching weather ...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result?.result ? (
                              <WeatherComponent
                                key={message.id}
                                weatherData={result.result}
                                location={query}
                              />
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

                          if (part.toolInvocation.toolName === "firecrawl") {
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
                                    Crawling website ...
                                  </p>
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                  </div>
                                </div>
                              );
                            }
                            return result?.result ? (
                              <Markdown
                                key={message.id}
                                text={result.result.content}
                                isUser={isUser}
                                images={result.result.images}
                                banner={result.result.banner}
                              />
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
              {/* Show uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-4 absolute bottom-[80px] left-[150px]">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Button
                        variant="outline"
                        className="relative bottom-[-5px]"
                        size="icon"
                        disabled={isDeleteImageLoading}
                      >
                        <Image
                          src={image.url}
                          alt={`Uploaded ${index + 1}`}
                          width={10}
                          height={10}
                          className="h-[35px] w-[35px] object-cover rounded-md"
                        />
                        <div
                          onClick={() => removeImage(index)}
                          className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-red-500 rounded-full"
                        >
                          <TiDelete />
                        </div>
                        {image.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                            <Loader2 className="animate-spin h-6 w-6" />
                          </div>
                        )}
                      </Button>
                    </div>
                  ))}
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
              <div className="flex items-center gap-3 w-full relative">
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
                <Button
                  onClick={() => {
                    if (!isUploadImageLoading) {
                      handleSubmit();
                      // clear images
                      setUploadedImages([]);
                    }
                  }}
                  variant="outline"
                  disabled={status !== "ready" || !input.trim()}
                  className="h-10 w-10 rounded-full border bg-white border-zinc-400 absolute right-2 bottom-2"
                >
                  <FaArrowUp />
                </Button>
              </div>
            </div>

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

            <Dialog
              open={!!selectedImage}
              onOpenChange={(open) => !open && setSelectedImage(null)}
            >
              <DialogContent className="max-w-[90vw] max-h-[90vh]">
                <div className="relative w-full h-full flex items-center justify-center">
                  {selectedImage && (
                    <Image
                      placeholder="blur"
                      loading="lazy"
                      blurDataURL={selectedImage.url}
                      src={selectedImage.url}
                      alt={selectedImage.name || "Preview"}
                      width={400}
                      height={400}
                      className="max-w-full max-h-[70vh] object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
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
