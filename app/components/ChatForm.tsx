"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { createChat } from "../tools/chat-store";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { IoMdSend } from "react-icons/io";

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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        console.log("visualizeData", toolCall);
      }
    },
    onFinish: async () => {
      if (!chatId) {
        console.log(messages);
        // const id = await createChat(); // create a new chat
        // router.push(`/chat/${id}`);
      } else {
        setCurrentMessages(messages);
        onChatUpdate?.();
      }

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      setIsLoading(true);
      fetch(`/api/chats/${chatId}`)
        .then((res) => res.json())
        .then((data) => {
          // The useChat hook doesn't provide a way to set initial messages directly,
          // so we'll need to trigger a new message with the existing history
          if (Array.isArray(data)) {
            setCurrentMessages(data);
            setMessages(data);
            setIsLoading(false);
          }
        })
        .catch((error) => console.error("Error loading chat history:", error))
        .finally(() => {
          setIsLoading(false);
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 100);
        });
    } else {
      createChat().then((id) => {
        router.push(`/chat/${id}`);
        setIsLoading(false);
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
  return (
    <div className="flex flex-col bg-zinc-800 p-2 rounded-xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div
            className={clsx(
              "overflow-y-auto scroll-hidden px-2",

              messages.length > 0 && " py-4 h-[calc(100vh-200px)]"
            )}
          >
            {messages.map((message) => {
              console.log("message", message);
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={` text-left py-2 rounded-2xl text-sm mr-6 ${
                      isUser ? "bg-blue-600 text-white" : " text-white"
                    } ${!isUser ? "max-w-[60%]" : "ml-6"} ${
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
                            console.log(headers);
                            console.log(rows);
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
            className="sticky bottom-0 w-full py-2 px-2 flex items-center gap-3"
          >
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
              className="bg-orange-600 flex items-center justify-center cursor-pointer hover:bg-orange-700 w-12 h-12 text-md text-white rounded-full disabled:opacity-50"
            >
              <IoMdSend />
            </button>
          </form>
        </div>
      )}
      {/* Chat input */}
    </div>
  );
}
