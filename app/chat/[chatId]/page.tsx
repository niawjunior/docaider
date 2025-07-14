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

  const suggestedPrompts = [
    {
      title: "Tell me about the document",
      subtitle: "Specific question about the document",
    },
    {
      title: "What is the author of the document?",
      subtitle: "Specific question about the document",
    },
    {
      title: "What is the title of the document?",
      subtitle: "Specific question about the document",
    },
    {
      title: "How to write a book?",
      subtitle: "General question",
    },
    {
      title: "What is the capital of Thailand?",
      subtitle: "General question",
    },
    {
      title: "What is the population of Thailand?",
      subtitle: "General question",
    },
  ];
  return isLoading ? (
    <GlobalLoader />
  ) : (
    <div>
      <Layout chatId={chatId as string} isLoading={isLoading}>
        <div className="flex justify-center  items-center min-h-screen">
          <ChatForm
            initialMessages={messages}
            chatId={chatId as string}
            suggestedPrompts={suggestedPrompts}
            isShowTool={true}
            isKnowledgeBase={false}
          />
        </div>
      </Layout>
    </div>
  );
}
