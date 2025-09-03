"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaRegFaceSadCry } from "react-icons/fa6";
import { IoArrowDownSharp } from "react-icons/io5";
import clsx from "clsx";
import Markdown from "../Markdown";
import { Loader2 } from "lucide-react";
import { CiWarning } from "react-icons/ci";

interface ChatMessagesProps {
  messages: any[];
  status: string;
  bottomRef?: React.RefObject<HTMLDivElement | null>;
  loading?: boolean;
  error?: string;
}

export default function ChatMessages({
  messages,
  status,
  bottomRef: externalBottomRef,
  loading,
  error,
}: ChatMessagesProps) {
  const t = useTranslations("chat");
  const internalBottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Use external ref if provided, otherwise use internal ref
  const bottomRef = externalBottomRef || internalBottomRef;

  // Handle scrolling to bottom
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // No longer need to update parent component

  // Set up scroll event listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 50;
      const isBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      setIsAtBottom(isBottom);
    };

    // Initial check
    handleScroll();

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={clsx(
          "overflow-auto scroll-hidden md:px-2 px-0 relative md:h-[calc(100dvh-415px)] h-[calc(100dvh-500px)]"
        )}
      >
        {loading && (
          <div className="absolute z-100 inset-0 flex items-center justify-center w-full h-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {messages.map((message: any, index: any) => {
          const isUser = message.role === "user";
          return (
            <div
              key={index}
              className={`flex relative py-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className="text-sm text-left">
                {message.parts?.map((part: any, index: any) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div key={index} className="">
                          <Markdown isUser={isUser} text={part.text} />
                          {error &&
                            message.id ===
                              messages[messages.length - 1]?.id && (
                              <div className="absolute left-0 rounded-md flex items-center gap-2 text-red-600">
                                <CiWarning className="h-4 w-4" />
                                <p className="text-sm font-medium">
                                  {t("error")}
                                </p>
                              </div>
                            )}
                          {status === "submitted" &&
                            message.id ===
                              messages[messages.length - 1]?.id && (
                              <div className="absolute left-3 flex items-center gap-1">
                                <span className="text-sm">{t("thinking")}</span>
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            )}
                        </div>
                      );
                    case "tool-askQuestion":
                      if (
                        message.id === messages[messages.length - 1]?.id &&
                        status === "streaming"
                      ) {
                        return (
                          <div
                            key={message.id}
                            className="flex items-center gap-2"
                          >
                            <p className="text-foreground text-sm">
                              {t("searchingDocument")}
                            </p>
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                          </div>
                        );
                      }
                      return part.output ? (
                        <div key={index}>
                          <Markdown isUser={isUser} text={part.output} />
                        </div>
                      ) : (
                        <div
                          key={message.id}
                          className="flex items-center gap-2"
                        >
                          <p className="text-foreground text-sm">
                            {t("errorMessage")}
                          </p>
                          <FaRegFaceSadCry />
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="pb-4" />
      </div>

      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-[20px] left-0 right-0 flex justify-center w-full">
          <button
            onClick={scrollToBottom}
            className="w-10 h-10 flex items-center justify-center z-10 bg-background text-foreground border border-border rounded-full p-2 hover:bg-accent transition"
            aria-label="Scroll to bottom"
          >
            <IoArrowDownSharp />
          </button>
        </div>
      )}
    </div>
  );
}
