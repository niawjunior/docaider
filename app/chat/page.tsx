"use client";
import { redirect } from "next/navigation";
import { createChat } from "../utils/aisdk/chat";
import { useGlobalLoader } from "../components/GlobalLoaderProvider";

export default function Chat() {
  const { showLoader } = useGlobalLoader();
  showLoader();
  createChat().then((chatId) => {
    redirect(`/chat/${chatId}`);
  });
}
