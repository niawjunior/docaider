"use client";

import { useRouter } from "next/navigation";
import { createChat } from "../tools/chat-store";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ChatLayout = ({
  children,
  chats,
  isLoading = false,
  isShowTitle = true,
}: {
  children: React.ReactNode;
  chats?: unknown[];
  isLoading?: boolean;
  isShowTitle?: boolean;
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <>
      <div className="flex h-screen bg-black text-white">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-2 p-1 w-12 cursor-pointer  rounded-lg text-orange-500"
        >
          {isSidebarOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 border-r border-zinc-800 p-4 flex flex-col gap-4 bg-zinc-900">
            <button
              onClick={createNewChat}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 mt-[50px] px-4 text-left font-medium"
            >
              + New chat
            </button>

            <div className="text-sm text-zinc-400 font-semibold">Recents</div>
            <ul className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                chats?.map((chat) => (
                  <li key={(chat as { id: string }).id}>
                    <button
                      onClick={() =>
                        router.push(`/chat/${(chat as { id: string }).id}`)
                      }
                      className="w-full text-left text-sm py-2 px-2 rounded hover:bg-zinc-800 truncate"
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
        <main className="flex-1 w-full flex flex-col items-center justify-center p-10 overflow-x-auto ">
          <div className="text-center w-full h-full flex flex-col items-center justify-center">
            {isShowTitle && (
              <p className="text-zinc-400 mb-6">How can I help you today?</p>
            )}

            <div className="bg-zinc-800 rounded-xl p-4 w-full min-w-[300px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatLayout;
