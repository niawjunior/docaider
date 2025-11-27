"use client";

import { useState, useEffect } from "react";

const Typewriter = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

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
    <div className={`fixed ${positionClasses[position]} z-[999999]`}>
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            y: 0,
            scale: 1,
            display: "flex",
            transition: { type: "spring", stiffness: 300, damping: 30 },
          },
          closed: {
            opacity: 0,
            y: 20,
            scale: 0.9,
            transition: { duration: 0.2 },
            transitionEnd: { display: "none" },
          },
        }}
        className="bg-transparent mb-2 flex-col"
        style={{
          width,
          height,
        }}
      >
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
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={chatboxTitle}
          />
        )}
      </motion.div>

      {/* Chat toggle button */}
      <motion.div
        // whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex justify-end"
      >
        <button
          onClick={toggleChat}
          className={`shadow-none bg-transparent p-0 flex items-center justify-center transition-all hover:scale-105 border-none outline-none`}
          style={{
            width: "auto",
            height: "auto",
          }}
        >
          {isOpen ? (
            <div
              className="w-14 bg-blue-400 text-white h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:rotate-90"
              
            >
              <X className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex items-end gap-4">
              {/* Typing Bubble */}
              <div className="bg-white px-4 py-2 rounded-2xl border-solid border-2 border-blue-200 rounded-br-none shadow-lg mb-4 max-w-[200px] hidden md:block">
                <p className="text-sm text-gray-700 font-medium">
                  <Typewriter text={welcomeMessage || "สวัสดีครับ มีอะไรให้ผมช่วยมั้ยครับ"} />
                </p>
              </div>

              {/* Avatar */}
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-solid border-2  border-blue-200 animate-[bounce_2s_infinite]">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                  <circle cx="50" cy="50" r="40" fill="#FFDFC4"></circle>
                  <path
                    d="M10,50 Q10,10 50,10 Q90,10 90,50"
                    fill="#8B4513"
                    stroke="#5A2D0C"
                    strokeWidth="2"
                  ></path>
                  <path
                    d="M10,50 Q20,30 30,45 Q40,25 50,45 Q60,25 70,45 Q80,30 90,50"
                    fill="#8B4513"
                  ></path>
                  <path d="M10,40 Q50,-10 90,40 Z" fill="#4299E1"></path>
                  <rect
                    x="25"
                    y="35"
                    width="50"
                    height="10"
                    rx="5"
                    fill="#2B6CB0"
                  ></rect>
                  <circle cx="35" cy="60" r="4" fill="#333"></circle>
                  <circle cx="65" cy="60" r="4" fill="#333"></circle>
                  <circle
                    cx="25"
                    cy="70"
                    r="5"
                    fill="#FFB6C1"
                    opacity="0.6"
                  ></circle>
                  <circle
                    cx="75"
                    cy="70"
                    r="5"
                    fill="#FFB6C1"
                    opacity="0.6"
                  ></circle>
                  <path
                    d="M40,75 Q50,85 60,75"
                    fill="none"
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </div>
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
