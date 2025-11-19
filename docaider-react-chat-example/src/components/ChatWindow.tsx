import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot } from "lucide-react";
import { ChatConfig } from "../types";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  messages: any[];
  isLoading: boolean;
  error: string | null | undefined;
  status: string;
  config: ChatConfig;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onStop: () => void;
}

export function ChatWindow({
  messages,
  isLoading,
  error,
  status,
  config,
  onClose,
  onSendMessage,
  onStop,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="bg-white rounded-lg shadow-lg mb-2 overflow-hidden flex flex-col"
      style={{
        width: config.appearance?.width,
        height: config.appearance?.height,
        boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e5e7eb",
        fontFamily: config.theme?.fontFamily,
      }}
    >
      {/* Chat header */}
      <div
        className="p-3 flex items-center justify-between"
        style={{
          backgroundColor: config.theme?.primaryColor,
          color: config.theme?.textColor,
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" style={{ color: config.theme?.textColor }} />
          <h3 className="font-medium">{config.appearance?.title}</h3>
        </div>
        <div className="flex gap-1">
          <button
            className="h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none"
            onClick={onClose}
            style={{ color: config.theme?.textColor }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-900"
              }`}
              style={{
                backgroundColor:
                  msg.role === "user" ? config.theme?.primaryColor : undefined,
              }}
            >
              {msg.parts?.map((part: any, index: number) => (
                <div key={index}>{part.type === "text" ? part.text : null}</div>
              ))}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {status === "streaming" && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-600">
                  AI is responding...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-3 py-2 text-xs text-red-500 bg-red-50 border-t border-red-200">
          <span>Error: {error}</span>
        </div>
      )}

      {/* Stop button when streaming */}
      {status === "streaming" && (
        <div className="px-3 py-2 border-t border-gray-200">
          <button
            className="h-6 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            onClick={onStop}
          >
            Stop
          </button>
        </div>
      )}

      {/* Message input */}
      <MessageInput
        onSendMessage={onSendMessage}
        placeholder={config.behavior?.inputPlaceholder}
        disabled={status === "streaming"}
        primaryColor={config.theme?.primaryColor}
      />

      {/* Powered by footer */}
      <div className="text-center text-xs p-1 text-gray-500 border-t border-gray-200">
        Powered by{" "}
        <a
          href="https://docaider.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline"
        >
          Docaider
        </a>
      </div>
    </motion.div>
  );
}
