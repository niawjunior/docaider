"use client";

import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import ChatForm from "@/app/components/ChatForm";
import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
export default function ChatPage() {
  const { chatId } = useParams(); // dynamic route param
  const [isLoading, setIsLoading] = useState(true);
  const { messages } = useChat({
    api: "/api/chat",
    id: chatId as string,
  });

  const [chats, setChats] = useState<unknown[]>([]);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/chats")
      .then((res) => res.json())
      .then(setChats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const onChatUpdate = () => {
    setIsLoading(true);
    fetch("/api/chats")
      .then((res) => res.json())
      .then(setChats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <Layout
      chatId={chatId as string}
      chats={chats}
      isLoading={isLoading}
      isShowTitle={messages.length === 0}
    >
      <ChatForm
        isLoading={isLoading}
        chatId={chatId as string}
        onChatUpdate={onChatUpdate}
      />
    </Layout>
  );
}
