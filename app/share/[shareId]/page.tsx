/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import BarChart from "@/app/components/BarChart";
import GlobalLoader from "@/app/components/GlobalLoader";
import PieChart from "@/app/components/PieChart";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaCopy } from "react-icons/fa";
import { IoArrowDownSharp } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { toast } from "sonner";
import "highlight.js/styles/github-dark.css"; // or choose another theme
import { FaRegFaceSadCry } from "react-icons/fa6";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import WebSearchComponent from "@/app/components/WebSearch";
import WeatherComponent from "@/app/components/WeatherComponent";

function extractTextFromChildren(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (typeof children === "object" && children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

const SharePage = () => {
  const router = useRouter();
  const { shareId } = useParams();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const fetchShareData = async () => {
    const response = await fetch(`/api/share/${shareId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch share data");
    }
    const data = await response.json();
    return data.messages;
  };

  // Add this function to handle image load
  const handleImageLoad = (messageId: string, index: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [`${messageId}-${index}`]: true,
    }));
  };

  const { data: messages, isLoading } = useQuery({
    queryKey: ["share", shareId],
    queryFn: fetchShareData,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 50;
      const isBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsAtBottom(isBottom);
    };

    // Call once in case content has grown
    handleScroll();

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages]);

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    router.push("/");
  };
  return isLoading ? (
    <GlobalLoader />
  ) : (
    <div className="flex h-dvh bg-black text-white">
      <main className="flex-1 w-full flex flex-col overflow-hidden ">
        <div className="flex items-center justify-between md:p-4 p-0">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="self-start p-0 flex"
          >
            <FaArrowLeft />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="  text-white ">This is a copy of a conversation.</h1>
            <p className="text-xs self-end text-zinc-400">
              {dayjs(messages.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </p>
          </div>
        </div>
        <div className="text-center w-full gap-8 md:p-4 p-0 h-full flex flex-col items-center">
          <div className="rounded-xl  w-full min-w-[300px]">
            <div className="flex flex-col items-center gap-4 ">
              <div className="w-full bg-zinc-800 p-2 rounded-xl md:mt-0 mt-2">
                <div
                  ref={containerRef}
                  className={clsx(
                    "overflow-auto scroll-hidden px-2",

                    messages?.length > 0 &&
                      " py-4 md:h-[calc(100dvh-140px)] h-[calc(100dvh-100px)]"
                  )}
                >
                  {messages.map((message: any) => {
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
                            ?.filter((attachment: any) =>
                              attachment.contentType?.startsWith("image/")
                            )
                            .map((attachment: any, index: any) => {
                              const imageKey = `${message.id}-${index}`;
                              const isLoaded = loadedImages[imageKey];

                              return (
                                <div key={imageKey} className="relative">
                                  <Image
                                    loading="lazy"
                                    width={200}
                                    height={200}
                                    className={`rounded-lg p-2 object-cover w-[200px] h-[200px] transition-opacity duration-300 ${
                                      isLoaded
                                        ? "opacity-100"
                                        : "opacity-0 absolute"
                                    }`}
                                    onClick={() =>
                                      setSelectedImage({
                                        url: attachment.url,
                                        name:
                                          attachment.name || "Image Preview",
                                      })
                                    }
                                    onLoad={() =>
                                      handleImageLoad(message.id, index)
                                    }
                                    src={attachment.url}
                                    alt={attachment.name || "Uploaded image"}
                                  />
                                </div>
                              );
                            })}

                          {message.parts.map((part: any, index: any) => {
                            if (part.type === "text") {
                              return (
                                <div key={index} className="">
                                  <ReactMarkdown
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                      h1: ({ children }) => (
                                        <h1 className="px-4 py-2 text-xl font-bold text-white">
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children }) => (
                                        <h2 className="px-4 py-2 text-lg font-semibold text-white">
                                          {children}
                                        </h2>
                                      ),
                                      h3: ({ children }) => (
                                        <h3 className="px-4 py-2 text-base font-medium text-white">
                                          {children}
                                        </h3>
                                      ),
                                      p: ({ children }) => (
                                        <p
                                          className={clsx(
                                            "px-4 py-2 leading-relaxed whitespace-pre-wrap  rounded-2xl text-sm text-white",
                                            isUser
                                              ? "bg-blue-600 text-white inline-block"
                                              : " text-white"
                                          )}
                                        >
                                          {children}
                                        </p>
                                      ),
                                      ul: ({ children }) => (
                                        <ul className="list-disc pl-8  py-2 text-white">
                                          {children}
                                        </ul>
                                      ),
                                      ol: ({ children }) => (
                                        <ol className="list-decimal pl-8  py-2 text-white">
                                          {children}
                                        </ol>
                                      ),
                                      li: ({ children }) => (
                                        <li className="py-2 text-white">
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
                                      // ✅ Inline code
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

                                        const handleCopy = () => {
                                          navigator.clipboard.writeText(
                                            codeString
                                          );
                                          toast("Copied to clipboard", {
                                            duration: 1500,
                                          });
                                        };

                                        return (
                                          <div className="relative group my-4">
                                            <Button
                                              variant="ghost"
                                              onClick={handleCopy}
                                              size="icon"
                                              className="absolute top-2  right-2 text-xs px-2 py-1 rounded hover:bg-zinc-700"
                                            >
                                              <FaCopy />
                                            </Button>
                                            <pre className="rounded-lg p-4 overflow-x-auto bg-zinc-900 text-sm">
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
                                    {part.text}
                                  </ReactMarkdown>
                                </div>
                              );
                            } else {
                              if (part.type === "tool-invocation") {
                                if (
                                  part.toolInvocation.toolName ===
                                  "generatePieChart"
                                ) {
                                  const result = (part.toolInvocation as any)
                                    ?.result;

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
                                  part.toolInvocation.toolName ===
                                  "generateBarChart"
                                ) {
                                  const result = (part.toolInvocation as any)
                                    ?.result;
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
                                  part.toolInvocation.toolName === "askQuestion"
                                ) {
                                  const result = (part.toolInvocation as any)
                                    ?.result;
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
                                      <ReactMarkdown
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                          h1: ({ children }) => (
                                            <h1 className="px-4 py-2 text-xl font-bold text-white">
                                              {children}
                                            </h1>
                                          ),
                                          h2: ({ children }) => (
                                            <h2 className="px-4 py-2 text-lg font-semibold text-white">
                                              {children}
                                            </h2>
                                          ),
                                          h3: ({ children }) => (
                                            <h3 className="px-4 py-2 text-base font-medium text-white">
                                              {children}
                                            </h3>
                                          ),
                                          p: ({ children }) => (
                                            <p
                                              className={clsx(
                                                "px-4 py-2 leading-relaxed whitespace-pre-wrap  rounded-2xl text-sm text-white",
                                                isUser
                                                  ? "bg-blue-600 text-white inline-block"
                                                  : " text-white"
                                              )}
                                            >
                                              {children}
                                            </p>
                                          ),
                                          ul: ({ children }) => (
                                            <ul className="list-disc pl-8  py-2 text-white">
                                              {children}
                                            </ul>
                                          ),
                                          ol: ({ children }) => (
                                            <ol className="list-decimal pl-8  py-2 text-white">
                                              {children}
                                            </ol>
                                          ),
                                          li: ({ children }) => (
                                            <li className="py-2 text-white">
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
                                          // ✅ Inline code
                                          code({
                                            node,
                                            className,
                                            children,
                                            ...props
                                          }) {
                                            const language =
                                              className?.replace(
                                                "language-",
                                                ""
                                              ) ?? "";
                                            const codeString =
                                              extractTextFromChildren(children);

                                            const handleCopy = () => {
                                              navigator.clipboard.writeText(
                                                codeString
                                              );
                                              toast("Copied to clipboard", {
                                                duration: 1500,
                                              });
                                            };

                                            return (
                                              <div className="relative group my-4">
                                                <Button
                                                  variant="ghost"
                                                  onClick={handleCopy}
                                                  size="icon"
                                                  className="absolute top-2  right-2 text-xs px-2 py-1 rounded hover:bg-zinc-700"
                                                >
                                                  <FaCopy />
                                                </Button>
                                                <pre className="rounded-lg p-4 overflow-x-auto bg-zinc-900 text-sm">
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
                                  part.toolInvocation.toolName === "generateTTS"
                                ) {
                                  const result = (part.toolInvocation as any)
                                    ?.result;
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
                                    <audio
                                      key={message.id}
                                      src={result}
                                      controls
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
                                  part.toolInvocation.toolName === "webSearch"
                                ) {
                                  const result = (part.toolInvocation as any)
                                    ?.result;
                                  const query = (part.toolInvocation as any)
                                    ?.args?.query;
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

                                if (
                                  part.toolInvocation.toolName === "weather"
                                ) {
                                  const result = (part.toolInvocation as any)
                                    ?.result;
                                  const query = (part.toolInvocation as any)
                                    ?.args?.location;
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
                              }
                            }
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div ref={bottomRef} />
                </div>

                <div className="flex flex-col items-center">
                  {!isAtBottom && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        bottomRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                      className="w-10 h-10 bottom-10 fixed  flex items-center justify-center z-10 bg-zinc-900 text-white border border-zinc-400 rounded-full p-2 hover:bg-zinc-800 transition"
                      aria-label="Scroll to bottom"
                    >
                      <IoArrowDownSharp />
                    </button>
                  )}
                </div>
              </div>
            </div>

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
      </main>
    </div>
  );
};

export default SharePage;
