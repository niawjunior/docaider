"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { IoMdOpen } from "react-icons/io";

import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";
import Sidebar from "./Sidebar";
import { CreditProvider } from "../context/CreditContext";
import { createChat } from "../utils/aisdk/chat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ChatLayout = ({
  children,
  isLoading = false,
  chatId,
  registerRefreshSidebar,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  chatId?: string;
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

  const { session } = useSupabaseSession();

  const createNewChat = async () => {
    const id = await createChat();
    router.push(`/chat/${id}`);
  };

  return (
    <CreditProvider userId={session?.user.id || ""}>
      <>
        <div className="flex h-dvh bg-black text-white">
          <div className="fixed top-4 flex z-[99] gap-4 px-4 justify-between w-[290px]">
            <div className="flex justify-between w-full ">
              <div className="flex gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        onClick={() => router.push("/")}
                        className="text-[20px] rounded-lg"
                      >
                        <GoHomeFill />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Go to home</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!isSidebarOpen && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <button
                          onClick={createNewChat}
                          className="text-[20px] rounded-lg"
                        >
                          <IoMdOpen />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create new chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {isSidebarOpen && (
                <div className="flex justify-end w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <button
                          onClick={createNewChat}
                          className="text-[20px] rounded-lg"
                        >
                          <IoMdOpen />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create new chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
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
          <main className="flex-1 w-full flex flex-col p-4 overflow-hidden ">
            <div className="text-center w-full gap-8 md:p-4 p-0 h-full flex flex-col items-center justify-center overflow-auto">
              <div className="rounded-xl  w-full min-w-[300px]">{children}</div>
            </div>
          </main>
        </div>
      </>
    </CreditProvider>
  );
};

export default ChatLayout;
