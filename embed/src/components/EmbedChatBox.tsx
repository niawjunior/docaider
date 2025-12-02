"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

import { Typewriter } from "./ui/Typewriter";

import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { MessageCircle, X, Bot, Minus, RefreshCw, FileText } from "lucide-react";
import { EmbedChatSession, type EmbedChatSessionRef } from "./EmbedChatSession";


export interface EmbedChatBoxProps {
  knowledgeBaseId: string;
  src: string;
  chatId: string | null;
  chatboxTitle?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
  welcomeMessage?: string;
  placeholder?: string;
  isInitializing?: boolean;
  initError?: Error | null;
  onRefresh?: () => void;
  documents?: { title: string }[];
  positionStrategy?: "fixed" | "absolute";
  theme?: "blue" | "gray" | "green";
}

export type EmbedTool = "context" | "readCurrentPage" | "knowledge-base" | "auto";

export interface EmbedChatBoxRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setWelcomeMessage: (message: string) => void;
  setMessage: (message: string) => void;
  sendMessage: (message: string) => void;
  useTool: (tool: EmbedTool, options?: { content?: string; prompt?: string }) => void;
}

export const EmbedChatBox = forwardRef<EmbedChatBoxRef, EmbedChatBoxProps>(({
  knowledgeBaseId,
  src,
  chatId,
  chatboxTitle = "AI Assistant",
  position = "bottom-right",
  width = "350px",
  height = "500px",
  welcomeMessage: initialWelcomeMessage = "Hello! How can I help you today?",
  placeholder = "Ask a question...",
  isInitializing = false,
  initError = null,
  onRefresh,
  documents = [],
  positionStrategy = "fixed",
  theme = "blue",
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const [welcomeMessage, setWelcomeMessageState] = useState(initialWelcomeMessage);
  const sessionRef = useRef<EmbedChatSessionRef>(null);
  const dragControls = useDragControls();

  console.log("EmbedChatBox: Rendering", { knowledgeBaseId, chatId });

  // Update welcome message if prop changes
  useEffect(() => {
    setWelcomeMessageState(initialWelcomeMessage);
  }, [initialWelcomeMessage]);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    setWelcomeMessage: (message: string) => setWelcomeMessageState(message),
    setMessage: (message: string) => {
      if (!isOpen) setIsOpen(true);
      sessionRef.current?.setMessage(message);
    },
    sendMessage: (message: string) => {
      if (!isOpen) setIsOpen(true);
      sessionRef.current?.sendMessage(message);
    },
    useTool: (tool: EmbedTool, options?: { content?: string; prompt?: string }) => {
      if (!isOpen) setIsOpen(true);
      sessionRef.current?.useTool(tool, options);
    },
  }), [isOpen]);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const alignmentClasses = {
    "bottom-right": "items-end",
    "bottom-left": "items-start",
    "top-right": "items-end",
    "top-left": "items-start",
  };

  const [positionState, setPositionState] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    if (isDraggingRef.current) return;
    setIsOpen(!isOpen);
  };

  // Reset dragging state when closed to prevent getting stuck
  useEffect(() => {
    if (!isOpen) {
      // Small timeout to ensure any pending drag events clear
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (positionStrategy === "absolute") return;
    const savedPosition = localStorage.getItem("docaider-chat-position");
    if (savedPosition) {
      try {
        setPositionState(JSON.parse(savedPosition));
      } catch (e) {
        console.error("Failed to parse saved position", e);
      }
    }
  }, [positionStrategy]);

  const handleDragEnd = (_: any, info: any) => {
    if (positionStrategy === "absolute") return;

    // Calculate new position based on drag offset
    let newX = positionState.x + info.offset.x;
    let newY = positionState.y + info.offset.y;

    // Boundary check
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate the potential new bounding box
      // Note: rect already includes the drag offset because the element moved
      
      // Check horizontal bounds
      if (rect.left < 0) {
        newX += -rect.left; // Push right
      } else if (rect.right > windowWidth) {
        newX -= (rect.right - windowWidth); // Push left
      }

      // Check vertical bounds
      if (rect.top < 0) {
        newY += -rect.top; // Push down
      } else if (rect.bottom > windowHeight) {
        newY -= (rect.bottom - windowHeight); // Push up
      }
    }

    const newPosition = { x: newX, y: newY };
    setPositionState(newPosition);
    localStorage.setItem("docaider-chat-position", JSON.stringify(newPosition));
    
    // Reset dragging flag after a short delay to prevent click trigger
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  return (
    <div className="docaider-embed" data-theme={theme}>
      <motion.div
        ref={containerRef}
        drag={positionStrategy === "fixed"}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        initial={positionStrategy === "absolute" ? { x: 0, y: 0 } : positionState}
        animate={positionStrategy === "absolute" ? { x: 0, y: 0 } : positionState}
        className={`${positionStrategy} ${positionClasses[position]} ${alignmentClasses[position]} z-[999999] flex flex-col`}
        style={{ x: positionStrategy === "absolute" ? 0 : positionState.x, y: positionStrategy === "absolute" ? 0 : positionState.y }}
      >
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
              ref={sessionRef}
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
            onPointerDown={(e) => {
              isDraggingRef.current = false;
              dragControls.start(e);
            }}
            onClick={toggleChat}
            className={`shadow-none bg-transparent p-0 flex items-center justify-center transition-all hover:scale-105 border-none outline-none`}
            style={{
              width: "auto",
              height: "auto",
            }}
          >
            {isOpen ? (
              <div
                className="w-14 bg-[var(--theme-primary)] text-white h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:rotate-90"
                
              >
                <X className="h-6 w-6" />
              </div>
            ) : (
              <div className="flex items-end gap-4">
                {/* Typing Bubble */}
                <div className="bg-white px-4 py-2 rounded-2xl border-solid border-2 border-[var(--theme-accent)] rounded-br-none shadow-lg mb-4 max-w-[200px] hidden md:block">
                  <p className="text-sm text-gray-700 font-nunito">
                    <Typewriter key={welcomeMessage} text={welcomeMessage || "สวัสดีครับ มีอะไรให้ผมช่วยมั้ยครับ"} />
                  </p>
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-solid border-2 border-[var(--theme-accent)] animate-[bounce_2s_infinite]">
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
                    <path d="M10,40 Q50,-10 90,40 Z" fill="var(--theme-primary)"></path>
                    <rect
                      x="25"
                      y="35"
                      width="50"
                      height="10"
                      rx="5"
                      fill="var(--theme-text-primary)"
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
      </motion.div>
    </div>
  );
});
