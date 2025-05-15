import { redirect } from "next/navigation";
import { createChat } from "../utils/aisdk/chat";
import Layout from "../components/Layout";
import GlobalLoader from "../components/GlobalLoader";

export default async function Chat() {
  const newChatId = await createChat();

  if (newChatId) {
    redirect(`/chat/${newChatId}`);
  }

  return (
    <>
      <Layout>
        <GlobalLoader />
      </Layout>
    </>
  );
}
