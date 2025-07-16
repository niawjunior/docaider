"use client";
import React, { useEffect, useRef, useMemo } from "react";
import { useChats } from "../hooks/useChats";
import clsx from "clsx";

interface KnowledgeSessionsProps {
  chatId?: string;
  knowledgeBaseId?: string;
  onChatClick: (chatId: string) => void;
}
const KnowledgeSessions = ({
  chatId,
  knowledgeBaseId,
  onChatClick,
}: KnowledgeSessionsProps) => {
  const sidebarRef = useRef<HTMLUListElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useChats({
      isKnowledgeBase: true,
      knowledgeBaseId,
    });
  const handleChatClick = (newChatId: string) => {
    if (newChatId === chatId) return; // Don't navigate if already on the same chat
    onChatClick(newChatId);
  };

  // Extract chats from pages - each page contains an array of chat objects directly
  const chats = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data?.pages]);

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

  const getMenuDisplayText = (chat: {
    id: string;
    messages: any[];
    created_at: string;
  }) => {
    let text = "";
    chat.messages.forEach((message: any) => {
      if (message.role === "user") {
        text = message.content;
      }
    });
    return text || "Untitled";
  };
  return (
    <ul ref={sidebarRef} className="flex-1 overflow-y-auto scroll-hidden ">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        chats?.map(
          (chat: { id: string; messages: any[]; created_at: string }) => (
            <li key={chat.id} className="py-1">
              <button
                onClick={() => handleChatClick(chat.id)}
                className={clsx(
                  "w-full text-left text-sm py-2 px-2 rounded hover:bg-zinc-800 truncate",
                  chatId === chat.id ? "bg-zinc-700" : ""
                )}
              >
                {getMenuDisplayText(chat)}
              </button>
            </li>
          )
        )
      )}
      {isFetchingNextPage && (
        <div className="py-2 text-xs text-center text-zinc-500 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}
    </ul>
  );
};

export default KnowledgeSessions;
