"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, ChevronDown, Bot } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use the AI SDK's useChat hook
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/support",
    }),
    // Add initial welcome message
    id: "support-chat",
  });
  console.log(messages);

  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 1000);
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage({ text: inputValue });
      setInputValue("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-background border rounded-lg shadow-lg mb-2 w-80 sm:w-96 overflow-hidden flex flex-col"
            style={{ height: "400px" }}
          >
            {/* Chat header */}
            <div className="p-3 border-b bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-medium">AI Support Assistant</h3>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-3 h-[200px] ">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex relative ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`  ${
                        msg.role === "user" ? " text-primary-foreground" : ""
                      }`}
                    >
                      {status === "submitted" &&
                        msg.id === messages[messages.length - 1].id && (
                          <div className="flex items-center gap-2 absolute left-0">
                            <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                              <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
                              <span>AI is thinking...</span>
                            </div>
                          </div>
                        )}
                      {msg.parts.map((part: any, index) => {
                        return (
                          <div key={index} className={`w-[200px]  `}>
                            {part.type === "text" && (
                              <p
                                key={index}
                                className={`rounded-lg px-2 py-2 text-sm whitespace-pre-wrap ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {part.text}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat status indicator */}
            {status === "streaming" && (
              <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
                <span>AI is responding...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 text-xs"
                  onClick={() => stop()}
                >
                  Stop
                </Button>
              </div>
            )}

            {/* Error indicator */}
            {error && (
              <div className="px-3 py-1 text-xs text-red-500 flex items-center gap-2">
                <span>Error: {error.message || "Something went wrong"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 text-xs"
                  onClick={() => sendMessage({ text: inputValue })}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything..."
                  className="min-h-10 resize-none"
                  disabled={status === "streaming" || status === "submitted"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    !inputValue.trim() ||
                    status === "streaming" ||
                    status === "submitted"
                  }
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex justify-end"
      >
        <Button
          onClick={toggleChat}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}
