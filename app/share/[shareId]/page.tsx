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
import { IoArrowDownSharp } from "react-icons/io5";
import "highlight.js/styles/github-dark.css"; // or choose another theme
import { FaRegFaceSadCry } from "react-icons/fa6";
import MainLayout from "@/app/components/MainLayout";
import { ArrowLeft } from "lucide-react";
import Markdown from "@/app/components/Markdown";

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
                          <div className="text-sm text-left">
                            {message.parts?.map((part: any, index: any) => {
                              switch (part.type) {
                                case "text":
                                  return (
                                    <div key={index} className="">
                                      <Markdown
                                        isUser={isUser}
                                        text={part.text}
                                      />
                                    </div>
                                  );
                                case "tool-askQuestion":
                                  return part.output ? (
                                    <div key={index}>
                                      <Markdown
                                        isUser={isUser}
                                        text={part.output}
                                      />
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
