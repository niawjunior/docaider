"use client";

import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import ChatForm from "@/app/components/ChatForm";
import { useEffect, useRef } from "react";
import { useGlobalLoader } from "@/app/components/GlobalLoaderProvider";
import { Message } from "@ai-sdk/react";
import { useState } from "react";
export default function ChatPage() {
  const { chatId } = useParams(); // dynamic route param
  const { showLoader, hideLoader } = useGlobalLoader();
  const [messages, setMessages] = useState<Message[]>([]);
  const refreshSidebarRef = useRef<() => void>(() => {});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (chatId) {
      setIsLoading(true);
      showLoader();
      fetch(`/api/chats/${chatId}`)
        .then((res) => res.json())
        .then((data) => {
          // The useChat hook doesn't provide a way to set initial messages directly,
          // so we'll need to trigger a new message with the existing history
          setMessages(data);
          hideLoader();
          setIsLoading(false);
        })
        .catch((error) => console.error("Error loading chat history:", error))
        .finally(() => {});
    }
  }, [chatId, setMessages]);

  return (
    <div>
      {!isLoading && (
        <Layout
          chatId={chatId as string}
          registerRefreshSidebar={(cb) => (refreshSidebarRef.current = cb)}
        >
          {!isLoading && (
            <ChatForm
              initialMessages={messages}
              chatId={chatId as string}
              onChatUpdate={() => refreshSidebarRef.current()}
            />
          )}
        </Layout>
      )}
    </div>
  );
}
