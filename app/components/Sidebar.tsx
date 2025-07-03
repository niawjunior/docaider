"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { useCredit } from "../hooks/useCredit";
import { useChats } from "../hooks/useChats";

interface SidebarProps {
  chatId?: string;
  isLoading?: boolean;
}

const Sidebar = ({ chatId, isLoading = false }: SidebarProps) => {
  const { session } = useSupabaseSession();
  const { credit, isLoading: creditLoading } = useCredit(
    session?.user.id || ""
  );
  // const { userConfig } = useUserConfig(session?.user.id || "");
  const sidebarRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const getMenuDisplayText = (chat: unknown) => {
    let text = "";
    (chat as { messages: unknown[] }).messages.forEach((message: unknown) => {
      if ((message as { role: string }).role === "user") {
        text = (message as { content: string }).content;
      }
    });
    return text || "Untitled";
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isChatsLoading,
  } = useChats();

  const chats = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleScroll = () => {
      if (
        sidebar.scrollTop + sidebar.clientHeight >=
        sidebar.scrollHeight - 50
      ) {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }
    };

    sidebar.addEventListener("scroll", handleScroll);
    return () => sidebar.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleChatClick = (newChatId: string) => {
    if (newChatId === chatId) return; // Don't navigate if already on the same chat

    router.push(`/chat/${newChatId}`);
    router.refresh();
  };

  return (
    <aside className="bg-zinc-900 p-4 flex flex-col gap-4 h-full w-72 min-w-72 border-r border-zinc-800 z-50">
      <div className="text-sm text-zinc-400 font-semibold mt-[55px] px-1">
        Knowledge Sessions
      </div>
      <ul ref={sidebarRef} className="flex-1 overflow-y-auto scroll-hidden ">
        {isLoading || creditLoading || isChatsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          chats?.map((chat) => (
            <li key={(chat as { id: string }).id} className="py-1">
              <button
                onClick={() => handleChatClick((chat as { id: string }).id)}
                className={clsx(
                  "w-full text-left text-sm py-2 px-2 rounded hover:bg-zinc-800 truncate",
                  chatId === (chat as { id: string }).id ? "bg-zinc-700" : ""
                )}
              >
                {getMenuDisplayText(chat as { messages: unknown[] })}
              </button>
            </li>
          ))
        )}
        {isFetchingNextPage && (
          <div className="py-2 text-xs text-center text-zinc-500 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
      </ul>

      <div className="text-xs border-t border-zinc-700 pt-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Knowledge Credits:</span>
          {creditLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          ) : (
            <span className="text-sm">{credit?.balance.toFixed(2) || 0}</span>
          )}
        </div>
        <div className="text-zinc-500">
          <p>Logged in as {session?.user.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
