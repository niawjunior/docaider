import { useState, useEffect } from "react";
import { EmbedChatBox } from "./components/EmbedChatBox";
import "./App.css";

function App() {
  const [config, setConfig] = useState<any | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

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
  const initializeChat = async (knowledgeBaseId: string, src: string) => {
    if (isInitializing || chatId) return; // Prevent multiple initializations

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

  return (
    <EmbedChatBox
      src={config.src}
      knowledgeBaseId={config.knowledgeBaseId}
      chatId={chatId}
      chatboxTitle={config.chatboxTitle}
      position={config.position}
      width={config.width}
      height={config.height}
      iconSize={config.iconSize}
      welcomeMessage={config.welcomeMessage}
      placeholder={config.placeholder}
      buttonText={config.buttonText}
      showButtonText={config.showButtonText}
      isInitializing={isInitializing}
      initError={initError}
    />
  );
}

export default App;
