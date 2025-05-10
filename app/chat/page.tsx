"use client";

import Layout from "../components/Layout";
import ChatForm from "../components/ChatForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChat } from "../tools/chat";
import { useParams } from "next/navigation";
import GlobalLoader from "../components/GlobalLoader";

export default function Dashboard() {
  const router = useRouter();
  const { chatId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!chatId) {
      setIsLoading(true);
      createChat().then((id) => {
        router.push(`/chat/${id}`);
      });
    }
  }, [chatId, router]);

  return (
    <>
      <Layout>
        {isLoading && <GlobalLoader />}
        <div className="w-full px-4">
          <ChatForm chatId={chatId as string} />
        </div>
      </Layout>
    </>
  );
}
