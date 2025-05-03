"use client";

import { useRouter } from "next/navigation";
import { createChat } from "../tools/chat-store";
import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { IoIosAddCircle } from "react-icons/io";

import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";

import clsx from "clsx";

const ChatLayout = ({
  children,
  chats,
  isLoading = false,
  chatId,
  isShowTitle = true,
}: {
  children: React.ReactNode;
  chats?: unknown[];
  isLoading?: boolean;
  chatId?: string;
  isShowTitle?: boolean;
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // Open by default on md+ screens
    }
    return true; // Fallback for SSR
  });
  const createNewChat = async () => {
    const id = await createChat(); // create a new chat
    router.push(`/chat/${id}`);
  };
  const getMenuDisplayText = (chat: unknown) => {
    let text = "";
    (chat as { messages: unknown[] }).messages.forEach((message: unknown) => {
      if ((message as { role: string }).role === "user") {
        text = (message as { content: string }).content;
      }
    });
    return text || "Untitled";
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize(); // Trigger on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="flex h-screen bg-black text-white">
        <div className="fixed top-4 flex z-[99] gap-4 w-72 px-4">
          <button
            onClick={() => router.push("/")}
            className="text-[20px] rounded-lg cursor-pointer"
          >
            <GoHomeFill />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[20px] rounded-lg cursor-pointer"
          >
            {isSidebarOpen ? (
              <TbLayoutSidebarLeftCollapseFilled />
            ) : (
              <TbLayoutSidebarLeftExpandFilled />
            )}
          </button>
        </div>
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside
            className={clsx(
              "bg-zinc-900 p-4 flex flex-col gap-4 z-50 transition-all duration-300",
              isSidebarOpen
                ? "fixed top-0 left-0 h-full w-72 border-r border-zinc-800"
                : "hidden md:block w-72 border-r border-zinc-800",
              "md:static md:h-auto md:flex"
            )}
          >
            <button
              onClick={createNewChat}
              className="bg-orange-600 flex items-center gap-2 hover:bg-orange-700 text-white rounded-lg py-2 mt-[50px] px-4 text-left font-medium"
            >
              <IoIosAddCircle /> New chat
            </button>

            <div className="text-sm text-zinc-400 font-semibold">Recents</div>
            <ul className="flex-1 overflow-y-auto scroll-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                chats?.map((chat) => (
                  <li key={(chat as { id: string }).id} className="py-1">
                    <button
                      onClick={() =>
                        router.push(`/chat/${(chat as { id: string }).id}`)
                      }
                      className={clsx(
                        "w-full text-left text-sm py-2 px-2 rounded hover:bg-zinc-800 truncate",
                        chatId === (chat as { id: string }).id
                          ? "bg-zinc-700"
                          : ""
                      )}
                    >
                      {getMenuDisplayText(chat as { messages: unknown[] })}
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="text-xs text-zinc-500 border-t border-zinc-700 pt-4 mt-4">
              <p className="text-zinc-400">Free plan</p>
            </div>
          </aside>
        )}

        {/* Main */}
        <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-x-auto">
          <div className="text-center w-full h-full flex flex-col items-center justify-center">
            {isShowTitle && (
              <p className="text-zinc-300 mb-6">How can I help you today?</p>
            )}

            <div className="rounded-xl p-4 w-full min-w-[300px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatLayout;
