"use client";
import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface Chat {
  id: string;
  messages: any[];
  created_at: string;
}

interface KnowledgeSessionsProps {
  chatId?: string;
  chats: Chat[];
  onChatClick: (chatId: string) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
}
const KnowledgeSessions = ({
  chatId,
  chats,
  onChatClick,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage
}: KnowledgeSessionsProps) => {
  const sidebarRef = useRef<HTMLUListElement>(null);
  
  const handleChatClick = (newChatId: string) => {
    onChatClick(newChatId);
  };

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
    const userMessage = chat.messages.findLast(
      (message: any) => message.role === "user"
    );
    const findMessage = userMessage?.parts[userMessage?.parts.length - 1]?.text;
    return findMessage || "Untitled";
  };
  return (
    <ul ref={sidebarRef} className="flex-1 overflow-y-auto scroll-hidden ">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        chats.map((chat) => (
            <li key={chat.id} className="py-1">
              <button
                onClick={() => handleChatClick(chat.id)}
                className={clsx(
                  "w-full text-left text-sm py-2 px-2 rounded hover:bg-accent truncate",
                  chatId === chat.id ? "bg-accent/50" : ""
                )}
                data-active={chatId === chat.id ? "true" : "false"}
              >
                {getMenuDisplayText(chat)}
              </button>
            </li>
          )
        )
      )}
      {isFetchingNextPage && (
        <div className="py-2 text-xs text-center text-muted-foreground flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </ul>
  );
};

export default KnowledgeSessions;
