"use client";

import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import ChatForm from "@/app/components/ChatForm";
import { useQuery } from "@tanstack/react-query";
import GlobalLoader from "@/app/components/GlobalLoader";
export default function ChatPage() {
  const { chatId } = useParams(); // dynamic route param

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat data");
      }
      return response.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return isLoading ? (
    <GlobalLoader />
  ) : (
    <div>
      <Layout chatId={chatId as string} isLoading={isLoading}>
        <ChatForm initialMessages={messages} chatId={chatId as string} />
      </Layout>
    </div>
  );
}
