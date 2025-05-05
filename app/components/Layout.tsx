"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";

import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";

import Sidebar from "./Sidebar";

const ChatLayout = ({
  children,
  isLoading = false,
  chatId,
  isShowTitle = true,
  registerRefreshSidebar,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  chatId?: string;
  isShowTitle?: boolean;
  registerRefreshSidebar?: (cb: () => void) => void;
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // Open by default on md+ screens
    }
    return true; // Fallback for SSR
  });

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
            className="text-[20px] rounded-lg"
          >
            <GoHomeFill />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[20px] rounded-lg"
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
          <Sidebar
            registerRefresh={registerRefreshSidebar}
            chatId={chatId}
            isLoading={isLoading}
          />
        )}
        {/* Main */}
        <main className="flex-1 w-full flex flex-col p-4 overflow-x-auto">
          <div className="text-center w-full gap-8 md:p-4 p-0 h-full flex flex-col items-center justify-center">
            {isShowTitle && (
              <div>
                <p className="text-2xl font-bold mb-2">Hello there!</p>
                <p className="text-zinc-300 mb-6">How can I help you today?</p>
              </div>
            )}
            <div className="rounded-xl  w-full min-w-[300px]">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatLayout;
