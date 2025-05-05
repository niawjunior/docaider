"use client";

import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import ChatForm from "@/app/components/ChatForm";
import { useRef } from "react";
export default function ChatPage() {
  const { chatId } = useParams(); // dynamic route param

  const refreshSidebarRef = useRef<() => void>(() => {});

  return (
    <Layout
      chatId={chatId as string}
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
