"use client";

import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import ChatForm from "@/app/components/ChatForm";
import { useChat } from "@ai-sdk/react";
import { useRef } from "react";
export default function ChatPage() {
  const { chatId } = useParams(); // dynamic route param
  const { messages } = useChat({
    api: "/api/chat",
    id: chatId as string,
  });

  const refreshSidebarRef = useRef<() => void>(() => {});

  return (
    <Layout
      chatId={chatId as string}
      isShowTitle={messages.length === 0}
      registerRefreshSidebar={(cb) => {
        refreshSidebarRef.current = cb;
      }}
    >
      <ChatForm
        chatId={chatId as string}
        onChatUpdate={() => {
          refreshSidebarRef.current(); // trigger sidebar refresh
        }}
      />
    </Layout>
  );
}
