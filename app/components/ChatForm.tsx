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

            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        })
        .catch((error) => console.error("Error loading chat history:", error))
        .finally(() => {
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
        {messages.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
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
        )}
        <div className="overflow-hidden  w-full bg-zinc-800 p-2 rounded-xl">
          <div
            ref={containerRef}
            className={clsx(
              "overflow-y-auto scroll-hidden px-2",

              messages.length > 0 && " py-4 h-[calc(100vh-200px)]"
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
                    } ${!isUser ? "max-w-[60%]" : ""} ${
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

                          if (
                            part.toolInvocation.toolName === "generateTable"
                          ) {
                            const tableResult = (
                              part.toolInvocation as unknown as {
                                result: {
                                  tableHeaders: string[];
                                  tableData: Record<string, string | number>[];
                                };
                              }
                            ).result;

                            const headers: string[] =
                              tableResult?.tableHeaders ?? [];
                            const rows: Record<string, string | number>[] =
                              tableResult?.tableData ?? [];
                            return (
                              <div
                                key={index}
                                className="overflow-x-auto scroll-hidden w-[600px] shadow border bg-zinc-600 text-white text-sm rounded"
                              >
                                <table className="min-w-full text-left table-auto">
                                  <thead className="bg-zinc-700">
                                    <tr>
                                      {headers.map((header, idx) => (
                                        <th
                                          key={idx}
                                          className="px-4 py-2 font-semibold text-zinc-200 whitespace-nowrap"
                                        >
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, i) => (
                                      <tr
                                        key={i}
                                        className="border-t border-zinc-500"
                                      >
                                        {headers.map((header, j) => (
                                          <td
                                            key={j}
                                            className="px-4 py-2 whitespace-nowrap"
                                          >
                                            {typeof row[header] === "number"
                                              ? new Intl.NumberFormat("en-US", {
                                                  notation: "standard",
                                                  compactDisplay: "short",
                                                }).format(row[header] as number)
                                              : row[header]}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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
