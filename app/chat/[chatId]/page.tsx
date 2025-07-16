"use client";

import { useParams } from "next/navigation";
import Layout from "../../components/Layout";
import ChatForm from "@/app/components/ChatForm";
export default function ChatPage() {
  const { chatId } = useParams(); // dynamic route param

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
  return (
    <div>
      <Layout chatId={chatId as string}>
        <div className="flex justify-center  items-center min-h-screen">
          <ChatForm
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
