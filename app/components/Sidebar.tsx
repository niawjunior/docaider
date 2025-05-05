"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoIosAddCircle } from "react-icons/io";
import clsx from "clsx";
import { createChat } from "../tools/chat-store";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { signOut } from "../login/action";

interface SidebarProps {
  chatId?: string;
  isLoading?: boolean;
  registerRefresh?: (cb: () => void) => void;
}

const Sidebar = ({
  chatId,
  isLoading = false,
  registerRefresh,
}: SidebarProps) => {
  const { session } = useSupabaseSession();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sidebarRef = useRef<HTMLUListElement>(null);
  const [chats, setChats] = useState<unknown[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 20;
  const router = useRouter();

  const createNewChat = async () => {
    const id = await createChat();
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

  const fetchChats = useCallback(
    async (customOffset?: number) => {
      const fetchOffset = customOffset ?? offset;

      if (loadingMore || !hasMore) return;

      setLoadingMore(true);
      const res = await fetch(
        `/api/chats?limit=${LIMIT}&offset=${fetchOffset}`
      );
      const data = await res.json();

      if (data.length < LIMIT) setHasMore(false);

      setChats((prev) => {
        if (fetchOffset === 0) return data; // 👈 replace when offset is 0
        const combined = [...prev, ...data];
        const unique = Array.from(
          new Map(
            combined.map((item) => [(item as { id: string }).id, item])
          ).values()
        );
        return unique;
      });

      setOffset(fetchOffset + LIMIT);
      setLoadingMore(false);
    },
    [offset, hasMore, loadingMore]
  );

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (registerRefresh) {
      registerRefresh(() => {
        console.log("Triggered sidebar refresh");

        setOffset(0);
        setHasMore(true);
        setLoadingMore(false);

        fetchChats(0);
      });
    }
  }, [registerRefresh, fetchChats]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleScroll = () => {
      if (
        sidebar.scrollTop + sidebar.clientHeight >=
        sidebar.scrollHeight - 50
      ) {
        if (hasMore) fetchChats();
      }
    };

    sidebar.addEventListener("scroll", handleScroll);
    return () => sidebar.removeEventListener("scroll", handleScroll);
  }, [hasMore, fetchChats]);

  return (
    <aside className="bg-zinc-900 p-4 flex flex-col gap-4 h-full w-72 border-r border-zinc-800 z-50">
      <button
        onClick={createNewChat}
        className="bg-orange-600 flex items-center gap-2 hover:bg-orange-700 text-white rounded-lg py-2 mt-[50px] px-4 text-left font-medium"
      >
        <IoIosAddCircle /> New chat
      </button>

      <div className="text-sm text-zinc-400 font-semibold">Recents</div>
      <ul ref={sidebarRef} className="flex-1 overflow-y-auto scroll-hidden">
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
                  chatId === (chat as { id: string }).id ? "bg-zinc-700" : ""
                )}
              >
                {getMenuDisplayText(chat as { messages: unknown[] })}
              </button>
            </li>
          ))
        )}
        {loadingMore && (
          <div className="py-2 text-xs text-center text-zinc-500 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}
        {!hasMore && (
          <div className="text-center text-xs text-zinc-400 py-4">
            No more chats
          </div>
        )}
      </ul>

      <div className="text-xs text-zinc-500 border-t border-zinc-700 pt-4 mt-4">
        {session ? (
          <div>
            <p>Logged in as {session.user.email}</p>
            <button onClick={() => signOut()} className="hover:text-white">
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="hover:text-white"
          >
            Sign In
          </button>
        )}
        <p className="text-zinc-400">Free plan</p>
      </div>
    </aside>
  );
};

export default Sidebar;
