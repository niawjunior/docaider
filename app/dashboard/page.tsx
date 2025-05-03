"use client";

import Layout from "../components/Layout";
import ChatForm from "../components/ChatForm";
import { useEffect, useState } from "react";
import GlobalLoader from "../components/GlobalLoader";

export default function Dashboard() {
  const [chats, setChats] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/chats")
      .then((res) => res.json())
      .then(setChats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      {isLoading && <GlobalLoader />}
      <Layout chats={chats} isLoading={isLoading}>
        <div className="w-full px-4">
          <ChatForm />
        </div>
      </Layout>
    </>
  );
}
