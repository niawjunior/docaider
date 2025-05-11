"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { IoMdSend } from "react-icons/io";
import { IoArrowDownSharp } from "react-icons/io5";

import { createClient } from "@supabase/supabase-js";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import GlobalLoader from "./GlobalLoader";
import Image from "next/image";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
interface ChatFormProps {
  chatId?: string;
  onChatUpdate?: () => void;
}

export default function ChatForm({ chatId, onChatUpdate }: ChatFormProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptToSubmit, setPromptToSubmit] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
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
                          console.log("part", part.toolInvocation);
                          if (
                            part.toolInvocation.toolName === "generatePieChart"
                          ) {
                            return (
                              <div key={index}>
                                <PieChart
                                  option={
                                    (
                                      part.toolInvocation as unknown as {
                                        result: {
                                          chartData: unknown;
                                        };
                                      }
                                    ).result?.chartData as {
                                      title: string;
                                      seriesData: {
                                        name: string;
                                        value: number;
                                        color: string;
                                      }[];
                                      backgroundColor: string;
                                      textColor: string;
                                    }
                                  }
                                />
                              </div>
                            );
                          }

                          if (
                            part.toolInvocation.toolName === "generateBarChart"
                          ) {
                            return (
                              <div key={index}>
                                <BarChart
                                  option={
                                    (
                                      part.toolInvocation as unknown as {
                                        result: {
                                          chartData: unknown;
                                        };
                                      }
                                    ).result?.chartData as {
                                      title: string;
                                      seriesData: {
                                        name: string;
                                        value: number;
                                        color: string;
                                      }[];
                                      backgroundColor: string;
                                      textColor: string;
                                    }
                                  }
                                />
                              </div>
                            );
                          }

                          // if (
                          //   part.toolInvocation.toolName === "getCryptoBalance"
                          // ) {
                          //   const balances =
                          //     (
                          //       part.toolInvocation as unknown as {
                          //         result: {
                          //           balances: unknown;
                          //         };
                          //       }
                          //     ).result?.balances || [];
                          //   return (
                          //     <div
                          //       key={index}
                          //       className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full mx-auto mt-6"
                          //     >
                          //       <h2 className="text-lg font-semibold text-white mb-4">
                          //         🪙 Crypto Wallet Balances
                          //       </h2>
                          //       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          //         {Object.entries(balances)
                          //           .filter(([, v]: any) => v.available > 0)
                          //           .map(([symbol, v]: any) => (
                          //             <div
                          //               key={symbol}
                          //               className="bg-zinc-800 rounded-lg p-4 flex flex-col items-start shadow hover:shadow-orange-500/20 transition"
                          //             >
                          //               <div className="text-white font-medium text-sm">
                          //                 {symbol}
                          //               </div>
                          //               <div className="text-orange-400 text-lg font-bold">
                          //                 {v.available}
                          //               </div>
                          //             </div>
                          //           ))}

                          //         {Object.values(balances).filter(
                          //           (v: any) => v.available > 0
                          //         ).length === 0 && (
                          //           <p className="text-sm text-zinc-400 col-span-full">
                          //             No balances available.
                          //           </p>
                          //         )}
                          //       </div>
                          //     </div>
                          //   );
                          // }

                          if (
                            part.toolInvocation.toolName === "getCryptoPrice"
                          ) {
                            const result = (part.toolInvocation as any)?.result;

                            return (
                              <div
                                key={index}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full"
                              >
                                {result ? (
                                  <>
                                    <h2 className="text-lg flex items-center gap-2 font-semibold text-white mb-4">
                                      <Image
                                        src={`/icons/${result.name.toUpperCase()}.png`}
                                        alt={result.name}
                                        width={20}
                                        height={20}
                                        loading="lazy"
                                      />{" "}
                                      {result?.name || "Crypto"} Price Overview
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
                                      <div>
                                        <span className="text-zinc-400">
                                          Date
                                        </span>
                                        <div className="text-blue-400 text-xl font-bold">
                                          {new Date(
                                            result.date
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-zinc-400">
                                          Current Price
                                        </span>
                                        <div className="text-orange-400 text-xl font-bold">
                                          ฿{" "}
                                          {result.price?.toLocaleString() ??
                                            "-"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-zinc-400">
                                          24h Change
                                        </span>
                                        <div
                                          className={`font-semibold ${
                                            result.percentChange24hr >= 0
                                              ? "text-green-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {result.percentChange24hr?.toFixed(
                                            2
                                          ) ?? "0.00"}
                                          %
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-zinc-400">
                                          Previous Close
                                        </span>
                                        <div>
                                          ฿{" "}
                                          {result.prevClose?.toLocaleString() ??
                                            "-"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-zinc-400">
                                          Previous Open
                                        </span>
                                        <div>
                                          ฿{" "}
                                          {result.prevOpen?.toLocaleString() ??
                                            "-"}
                                        </div>
                                      </div>
                                    </div>

                                    {result.insights && (
                                      <div className="mt-6 text-sm text-zinc-300">
                                        <h3 className="font-semibold text-white mb-2">
                                          💡 Insight
                                        </h3>
                                        <p className="leading-relaxed">
                                          {result.insights}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <p className="text-white text-sm">
                                      Fetching price data...
                                    </p>
                                    <div className="flex items-center justify-center py-4">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          if (
                            part.toolInvocation.toolName ===
                            "getCryptoMarketSummary"
                          ) {
                            const result = (part.toolInvocation as any)?.result;

                            return (
                              <div
                                key={index}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full  mx-auto mt-6"
                              >
                                {result ? (
                                  <div>
                                    <h2 className="text-lg flex items-center gap-2 font-semibold text-white mb-4">
                                      <Image
                                        src="/icons/bitkub.svg"
                                        alt="Bitkub"
                                        width={70}
                                        height={70}
                                        loading="lazy"
                                      />{" "}
                                      Bitkub Crypto Summary
                                    </h2>
                                    <p className="text-orange-400 mb-2 text-sm">
                                      Bitkub currently lists{" "}
                                      <strong>{result.total}</strong> unique
                                      cryptocurrencies.
                                    </p>
                                    <div className="text-sm text-zinc-400 flex flex-wrap gap-2">
                                      {result.coins.map(
                                        (
                                          c: { symbol: string; volume: number },
                                          i: number
                                        ) => (
                                          <div
                                            key={i}
                                            className="flex items-center gap-2"
                                          >
                                            <Image
                                              src={`/icons/${c.symbol.toUpperCase()}.png`}
                                              alt={c.symbol}
                                              width={20}
                                              height={20}
                                              loading="lazy"
                                            />
                                            <span
                                              key={i}
                                              className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-xs"
                                            >
                                              {c.symbol}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <p className="text-white text-sm">
                                      Fetching market summary...
                                    </p>
                                    <div className="flex items-center justify-center py-4">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                  </div>
                                )}
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
              <button
                type="submit"
                disabled={status !== "ready"}
                className="bg-orange-600 flex items-center justify-center hover:bg-orange-700 w-12 h-12 text-md text-white rounded-full disabled:opacity-50"
              >
                <IoMdSend />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
