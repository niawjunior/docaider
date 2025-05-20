"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChat } from "../utils/aisdk/chat";
import GlobalLoader from "../components/GlobalLoader";

export default function Chat() {
  const router = useRouter();

  useEffect(() => {
    async function initChat() {
      const chatId = await createChat();
      router.push(`/chat/${chatId}`);
    }
    initChat();
  }, [router]);

  return <GlobalLoader />;
}
