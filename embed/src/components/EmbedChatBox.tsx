"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot, Minus, RefreshCw, FileText } from "lucide-react";
import { EmbedChatSession } from "./EmbedChatSession";


interface EmbedChatBoxProps {
  knowledgeBaseId: string;
  src: string;
  chatId: string | null;
  chatboxTitle?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
  iconSize?: string;
  welcomeMessage?: string;
  placeholder?: string;
  buttonText?: string;
  showButtonText?: boolean;
  isInitializing?: boolean;
  initError?: Error | null;
  onRefresh?: () => void;
  documents?: { title: string }[];
}

export function EmbedChatBox({
  knowledgeBaseId,
  src,
  chatId,
  chatboxTitle = "AI Assistant",
  position = "bottom-right",
  width = "350px",
  height = "500px",
  iconSize = "50px",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Ask a question...",
  buttonText = "Chat with AI",
  showButtonText = false,
  isInitializing = false,
  initError = null,
  onRefresh,
  documents = [],
}: EmbedChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFileList, setShowFileList] = useState(false);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg mb-2 overflow-hidden flex flex-col"
            style={{
              width,
              height,
              boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* Chat header */}
            <div
              className="p-3 flex items-center justify-between"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <Bot
                  className="h-5 w-5"
                  style={{ color: "var(--primary-foreground)" }}
                />
                <h3 className="font-medium">{chatboxTitle}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  className="h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  style={{ color: "var(--primary-foreground)" }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none"
                  onClick={() => setShowFileList(true)}
                  title="File List"
                  style={{ color: "var(--primary-foreground)" }}
                >
                  <FileText className="h-4 w-4" />
                </button>
                {onRefresh && (
                  <button
                    className="h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none"
                    onClick={onRefresh}
                    title="Start New Chat"
                    style={{ color: "var(--primary-foreground)" }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Session */}
            {chatId && (
              <EmbedChatSession
                key={chatId}
                knowledgeBaseId={knowledgeBaseId}
                src={src}
                chatId={chatId}
                welcomeMessage={welcomeMessage}
                placeholder={placeholder}
                isInitializing={isInitializing}
                initError={initError}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex justify-end"
      >
        <button
          onClick={toggleChat}
          className={`shadow-lg ${
            showButtonText ? "rounded-lg px-4 py-2" : "rounded-full"
          } flex items-center justify-center transition-opacity hover:opacity-90 border-none outline-none`}
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            width: showButtonText ? "auto" : iconSize,
            height: showButtonText ? "auto" : iconSize,
          }}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {showButtonText && (
                <span className="font-medium">{buttonText}</span>
              )}
            </div>
          )}
        </button>
      </motion.div>

      
      {/* File List Modal */}
      <AnimatePresence>
        {showFileList && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full h-full max-h-[90%] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-medium text-sm">Available Documents</h3>
                <button
                  onClick={() => setShowFileList(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {documents.length > 0 ? (
                  <ul className="space-y-2">
                    {documents.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-md bg-gray-50 text-sm text-gray-700"
                      >
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{doc.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No documents available.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
