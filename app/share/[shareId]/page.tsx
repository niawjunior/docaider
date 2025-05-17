"use client";
import BarChart from "@/app/components/BarChart";
import CryptoPriceOverview from "@/app/components/CryptoPriceOverview";
import CryptoSummary from "@/app/components/CryptoSummary";
import GlobalLoader from "@/app/components/GlobalLoader";
import PieChart from "@/app/components/PieChart";
import { Button } from "@/components/ui/button";
import { Message, useChat } from "@ai-sdk/react";
import clsx from "clsx";
import dayjs from "dayjs";
// import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoArrowDownSharp } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

const SharePage = () => {
  const router = useRouter();
  const { shareId } = useParams();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { messages, setMessages, input, status } = useChat({
    api: "/api/chat",
    id: chatId!,
    initialMessages: currentMessages,
    sendExtraMessageFields: true,
    body: {
      chatId: chatId!,
    },

    onError: (error) => {
      console.log("onError", error);
    },
  });

  useEffect(() => {
    const fetchShareData = async () => {
      setIsLoading(true);
      const response = await fetch(`/api/share/${shareId}`);
      const data = await response.json();
      setShareData(data);
      setCurrentMessages(data.messages);
      setMessages(data.messages);
      setChatId(data.chat_id);
      setIsLoading(false);
    };
    fetchShareData();
  }, [setMessages, shareId]);
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

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    router.push("/");
  };
  return (
    <>
      {isLoading && <GlobalLoader />}
      <div className="flex h-dvh bg-black text-white">
        <main className="flex-1 w-full flex flex-col p-4 overflow-hidden ">
          <div className="flex items-center justify-between md:p-4 p-0">
            <Button variant="ghost" onClick={handleBack}>
              <FaArrowLeft />
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="  text-white ">
                This is a copy of a conversation.
              </h1>
              <p className="text-xs self-end text-zinc-400">
                {dayjs(shareData?.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
            </div>
          </div>
          <div className="text-center w-full gap-8 md:p-4 p-0 h-full flex flex-col items-center justify-center overflow-auto">
            <div className="rounded-xl  w-full min-w-[300px]">
              <div className="flex flex-col items-center gap-4 ">
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
                                    part.toolInvocation.toolName ===
                                    "generatePieChart"
                                  ) {
                                    const result = (part.toolInvocation as any)
                                      ?.result;

                                    return (
                                      <div key={index}>
                                        <PieChart option={result?.chartData} />
                                      </div>
                                    );
                                  }

                                  if (
                                    part.toolInvocation.toolName ===
                                    "generateBarChart"
                                  ) {
                                    const result = (part.toolInvocation as any)
                                      ?.result;
                                    return (
                                      <div key={index}>
                                        <BarChart option={result?.chartData} />
                                      </div>
                                    );
                                  }

                                  if (
                                    part.toolInvocation.toolName ===
                                    "getCryptoPrice"
                                  ) {
                                    const result = (part.toolInvocation as any)
                                      ?.result;
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
                                    const result = (part.toolInvocation as any)
                                      ?.result;

                                    return (
                                      <CryptoSummary
                                        key={index}
                                        data={result}
                                      />
                                    );
                                  }

                                  if (
                                    part.toolInvocation.toolName ===
                                    "askQuestion"
                                  ) {
                                    const result = (part.toolInvocation as any)
                                      ?.result;

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
                    <form className="sticky bottom-0 flex-col w-full py-2 px-2 flex items-center gap-3">
                      {!isAtBottom && (
                        <button
                          onClick={() =>
                            bottomRef.current?.scrollIntoView({
                              behavior: "smooth",
                            })
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
                          placeholder={
                            status !== "ready"
                              ? "Thinking..."
                              : "Ask anything..."
                          }
                          disabled={true}
                          rows={1}
                          className="flex-1 bg-zinc-900 text-white px-4 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SharePage;
