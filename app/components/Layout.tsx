"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { IoMdOpen } from "react-icons/io";
import { useTranslations } from "next-intl";

import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";
import Sidebar from "./Sidebar";
import { createChat } from "../utils/aisdk/chat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const ChatLayout = ({
  children,
  isLoading = false,
  chatId,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  chatId?: string;
}) => {
  const router = useRouter();
  const t = useTranslations("layout");
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

  const createNewChat = async () => {
    const id = await createChat();
    router.push(`/chat/${id}`);
  };

  return (
    <>
      <div className="flex h-dvh bg-black text-white">
        <div className="fixed top-4 flex z-[99] gap-4 px-4 justify-between w-[290px]">
          <div className="flex justify-between w-full ">
            <div className="flex gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      onClick={() => router.push("/")}
                      className="text-[20px] rounded-lg"
                    >
                      <GoHomeFill />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("goToHome")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="text-[20px] rounded-lg"
                    >
                      {isSidebarOpen ? (
                        <TbLayoutSidebarLeftCollapseFilled />
                      ) : (
                        <TbLayoutSidebarLeftExpandFilled />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("toggleSidebar")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {!isSidebarOpen && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        onClick={createNewChat}
                        className="text-[20px] rounded-lg"
                      >
                        <IoMdOpen />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("createNewChat")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex justify-end w-full ">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        onClick={createNewChat}
                        className="text-[20px] rounded-lg"
                      >
                        <IoMdOpen />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("createNewChat")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
        {/* Sidebar */}
        {isSidebarOpen && <Sidebar chatId={chatId} isLoading={isLoading} />}
        {/* Main */}
        <main className="flex-1 w-full flex flex-col p-2 overflow-hidden ">
          <div className="text-center w-full gap-8  p-0 h-full flex flex-col items-center">
            <div className="rounded-xl  w-full min-w-[300px]">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatLayout;
