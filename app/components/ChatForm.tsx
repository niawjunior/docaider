import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { createChat } from "../tools/chat-store";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Echart from "./Echart";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
interface ChatFormProps {
  chatId?: string;
  onChatUpdate?: () => void;
}

export default function ChatForm({ chatId, onChatUpdate }: ChatFormProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    status,
  } = useChat({
    api: "/api/chat",
    initialMessages: currentMessages,
    onResponse: (response) => {
      console.log("onResponse", response);
    },
    onFinish: async (messages) => {
      console.log("onFinish", messages);
      const chatId = await createChat(messages);
      console.log("Created chat with ID:", chatId);
      setCurrentMessages(messages);
      setIsLoading(false);
      if (onChatUpdate) {
        onChatUpdate();
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (chatId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/chat/${chatId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.statusText}`);
          }
          const data = await response.json();
          setCurrentMessages(data.messages);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching messages:", error);
          setIsLoading(false);
        }
      };
      fetchMessages();
    } else {
      setIsLoading(false);
    }
  }, [chatId]);

  const handleCameraToggle = () => {
    setIsCameraOpen(!isCameraOpen);
  };

  const handleCameraStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Failed to access camera. Please check your permissions.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        setImageBase64(dataURL);
      }
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleSubmitWithImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBase64) return;

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      const imageUrl = data.url;

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: imageUrl,
      };

      setCurrentMessages((prev) => [...prev, newMessage]);
      handleInputChange(imageUrl);
      handleSubmit();
      setImageBase64(null);
      handleStopCamera();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={clsx(
                  "flex items-start gap-3",
                  message.role === "assistant"
                    ? "justify-end"
                    : "justify-start"
                )}
              >
                <div
                  className={clsx(
                    "rounded-lg p-3 max-w-[70%]",
                    message.role === "assistant"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  {message.role === "assistant" && message.content?.includes("<chart>") ? (
                    <div className="flex flex-col gap-2">
                      <Echart
                        option={JSON.parse(
                          message.content
                            .split("<chart>")[1]
                            .split("</chart>")[0]
                        )}
                      />
                      {message.content.includes("<table>") && (
                        <div className="mt-4">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                {(message.content.split("<table>")[1]
                                  .split("</table>")[0]
                                  .split("<tr>")[1]
                                  .split("</tr>")[0]
                                  .split("<td>")
                                  .map((cell) => cell.split("</td>")[0]))
                                  .filter((cell) => cell)
                                  .map((header, idx) => (
                                    <th
                                      key={idx}
                                      className="px-4 py-2 text-left text-sm font-medium text-gray-900"
                                    >
                                      {header}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {message.content
                                .split("<table>")[1]
                                .split("</table>")[0]
                                .split("<tr>")
                                .slice(2)
                                .map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={
                                      rowIndex % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    }
                                  >
                                    {row
                                      .split("</tr>")[0]
                                      .split("<td>")
                                      .map((cell) => cell.split("</td>")[0])
                                      .filter((cell) => cell)
                                      .map((cell, cellIndex) => (
                                        <td
                                          key={cellIndex}
                                          className="px-4 py-2 text-sm text-gray-900"
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>

        {isCameraOpen && (
          <div className="mt-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg border border-gray-300"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleCapture}
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Capture
              </button>
              <button
                onClick={handleStopCamera}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Stop Camera
              </button>
            </div>
          </div>
        )}

        {!isCameraOpen && (
          <button
            onClick={handleCameraToggle}
            className="mt-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            Open Camera
          </button>
        )}

        {imageBase64 && !isCameraOpen && (
          <div className="mt-4">
            <img
              src={imageBase64}
              alt="Captured"
              className="rounded-lg border border-gray-300 max-w-full"
            />
            <button
              onClick={() => setImageBase64(null)}
              className="mt-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Remove Image
            </button>
          </div>
        )}

        {imageBase64 && (
          <button
            onClick={handleSubmitWithImage}
            className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Send Image
          </button>
        )}
      </div>
    </div>
  );
}