/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import GlobalLoader from "@/app/components/GlobalLoader";
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
import MainLayout from "@/app/components/MainLayout";
import { ArrowLeft } from "lucide-react";

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
  const fetchShareData = async () => {
    const response = await fetch(`/api/share/${shareId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch share data");
    }
    const data = await response.json();
    return data.messages;
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
    <MainLayout>
      <div className="flex text-white">
        <main className="flex-1 w-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            <div className="flex flex-col gap-1">
              <h1 className="text-xs  text-white ">
                This is a copy of a conversation.
              </h1>
              <p className="text-xs self-end text-zinc-400">
                {dayjs(messages.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
            </div>
          </div>
          <div className="text-center w-full gap-8 md:p-4 p-2 h-full flex flex-col items-center">
            <div className="rounded-xl  w-full min-w-[300px]">
              <div className="flex flex-col items-center gap-4 ">
                <div className="w-full bg-zinc-800 p-2 rounded-xl md:mt-0 mt-2">
                  <div
                    ref={containerRef}
                    className={clsx(
                      "overflow-auto scroll-hidden px-2",

                      messages?.length > 0 &&
                        " py-4 md:h-[calc(100dvh-330px)] h-[calc(100dvh-100px)]"
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
                                      {part.text}
                                    </ReactMarkdown>
                                  </div>
                                );
                              } else {
                                if (part.type === "tool-invocation") {
                                  if (
                                    part.toolInvocation.toolName ===
                                    "askQuestion"
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
                                                extractTextFromChildren(
                                                  children
                                                );

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
                                          Something went wrong. Please try
                                          again.
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
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default SharePage;
