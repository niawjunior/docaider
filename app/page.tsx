"use client";

import Layout from "./components/Layout";
import ChatForm from "./components/ChatForm";
import { useEffect, useState } from "react";

export default function Home() {
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
    <Layout chats={chats} isLoading={isLoading}>
      <ChatForm />
    </Layout>
  );
}
