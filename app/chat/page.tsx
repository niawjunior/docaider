"use client";
import { redirect } from "next/navigation";
import { createChat } from "../utils/aisdk/chat";

export default function Chat() {
  createChat().then((chatId) => {
    redirect(`/chat/${chatId}`);
  });
}
