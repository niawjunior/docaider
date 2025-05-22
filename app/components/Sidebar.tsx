"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { useCredit } from "../hooks/useCredit";
import { useChats } from "../hooks/useChats";
import { Button } from "@/components/ui/button"; // Import ShadCN Button
import { Loader2 } from "lucide-react"; // Import Loader2 for consistency

interface SidebarProps {
  chatId?: string;
  isLoading?: boolean; // This isLoading prop seems to be a general loading state from parent
}

const Sidebar = ({
  chatId,
  isLoading: parentIsLoading = false,
}: SidebarProps) => {
  const { session } = useSupabaseSession();
  const { credit, isLoading: creditLoading } = useCredit(
    session?.user.id || "",
  );
  const sidebarRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const getMenuDisplayText = (chat: unknown) => {
    let text = "";
    // Ensure messages exist and is an array before trying to iterate
    const messages = (chat as { messages?: unknown[] })?.messages;
    if (Array.isArray(messages)) {
      messages.forEach((message: unknown) => {
        if ((message as { role: string }).role === "user") {
          text = (message as { content: string }).content;
        }
      });
    }
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
    if (newChatId === chatId) return;

    router.push(`/chat/${newChatId}`);
    router.refresh();
  };

  const isLoading = parentIsLoading || creditLoading || isChatsLoading;

  return (
    <aside className="bg-zinc-900 p-4 flex flex-col gap-4 h-full w-72 min-w-72 border-r border-zinc-800 z-50">
      <div className="text-sm text-zinc-400 font-semibold mt-[50px]">
        Recents
      </div>
      <ul ref={sidebarRef} className="flex-1 overflow-y-auto scroll-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          chats?.map((chat) => (
            <li key={(chat as { id: string }).id} className="py-1">
              <Button
                variant="ghost"
                onClick={() => handleChatClick((chat as { id: string }).id)}
                className={clsx(
                  "w-full text-left text-sm py-2 px-2 rounded truncate justify-start h-auto", // justify-start for text-left alignment
                  chatId === (chat as { id: string }).id
                    ? "bg-zinc-700 hover:bg-zinc-700/80"
                    : "hover:bg-zinc-800",
                )}
              >
                {getMenuDisplayText(chat as { messages: unknown[] })}
              </Button>
            </li>
          ))
        )}
        {isFetchingNextPage && (
          <div className="py-2 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        )}
      </ul>

      <div className="text-xs border-t border-zinc-700 pt-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Credits:</span>
          {creditLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
          ) : (
            <span className="text-sm">
              {credit?.balance !== undefined
                ? credit.balance.toFixed(2)
                : "0.00"}
            </span>
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
