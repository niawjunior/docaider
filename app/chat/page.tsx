"use client";

import Layout from "../components/Layout";
import ChatForm from "../components/ChatForm";

export default function Dashboard() {
  return (
    <>
      <Layout>
        <div className="w-full px-4">
          <ChatForm />
        </div>
      </Layout>
    </>
  );
}
