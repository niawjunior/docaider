import { useState, useEffect } from "react";
import { EmbedChatBox } from "./components/EmbedChatBox";
import "./App.css";

function App() {
  const [config, setConfig] = useState<any | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  const [documents, setDocuments] = useState<{ title: string }[]>([]);

  useEffect(() => {
    // Get configuration from window object
    const windowConfig = window.DocaiderChatConfig;
    if (windowConfig) {
      setConfig(windowConfig);
      // Initialize chat as soon as we have the config
      initializeChat(windowConfig.knowledgeBaseId, windowConfig.src);
    } else {
      console.error("Docaider ChatConfig not found in window object");
    }
  }, []);

  // Initialize chat with the API
  const initializeChat = async (
    knowledgeBaseId: string,
    src: string,
    force = false
  ) => {
    if (isInitializing || (chatId && !force)) return; // Prevent multiple initializations

    setIsInitializing(true);
    try {
      const response = await fetch(`${src}/api/embed/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeBaseId,
          referrer: document.referrer || window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize chat");
      }

      const data = await response.json();
      setChatId(data.chatId);
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setInitError(
        error instanceof Error ? error : new Error("Failed to initialize chat")
      );
    } finally {
      setIsInitializing(false);
    }
  };

  if (!config || !chatId) {
    return null; // Don't render anything if config is not available
  }

  const handleRefresh = () => {
    if (config) {
      // Don't set chatId to null here, just re-initialize with force=true
      // This keeps the EmbedChatBox mounted, but the EmbedChatSession inside it will re-mount
      // when the new chatId is set by initializeChat
      initializeChat(config.knowledgeBaseId, config.src, true);
    }
  };

  return (
    <EmbedChatBox
      src={config.src}
      knowledgeBaseId={config.knowledgeBaseId}
      chatId={chatId}
      chatboxTitle={config.chatboxTitle}
      position={config.position}
      width={config.width}
      height={config.height}
      welcomeMessage={config.welcomeMessage}
      placeholder={config.placeholder}
      isInitializing={isInitializing}
      initError={initError}
      onRefresh={handleRefresh}
      documents={documents}
      theme={config.theme}
    />
  );
}

export default App;
