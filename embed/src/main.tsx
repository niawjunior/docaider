import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../src/App";

// Self-executing function to initialize the embed chat
(function () {
  // Get the script tag that loaded this file
  const scriptTag = document.currentScript as HTMLScriptElement;

  if (!scriptTag) {
    console.error("Docaider: Could not find script tag");
    return;
  }
  const origin = new URL(scriptTag.getAttribute("src")!).origin;

  // Extract configuration from data attributes
  const config = {
    knowledgeBaseId: scriptTag.getAttribute("data-kb-id"),
    src: origin,
    primaryColor: scriptTag.getAttribute("data-primary-color") || "#0091ff",
    textColor: scriptTag.getAttribute("data-text-color") || "#FFFFFF",
    position: scriptTag.getAttribute("data-position") || "bottom-right",
    welcomeMessage:
      scriptTag.getAttribute("data-welcome-message") ||
      "Hello! How can I help you today?",
    buttonText: scriptTag.getAttribute("data-button-text") || "Chat with AI",
    showButtonText: scriptTag.getAttribute("data-show-button-text") === "true",
    height: scriptTag.getAttribute("data-height") || "500px",
    width: scriptTag.getAttribute("data-width") || "350px",
    chatboxTitle: scriptTag.getAttribute("data-title") || "AI Assistant",
    placeholder:
      scriptTag.getAttribute("data-placeholder") || "Ask a question...",
  };

  // Validate required configuration
  if (!config.knowledgeBaseId) {
    console.error(
      "Docaider: Missing knowledge base ID. Please add data-kb-id attribute to the script tag."
    );
    return;
  }

  // Set CSS variables for dynamic colors - scoped to embed container only
  const style = document.createElement("style");
  style.textContent = `
    /* Scoped CSS variables for Docaider embed - won't affect host website */
    #docaider-embed-container {
      --primary-color: ${config.primaryColor};
      --text-color: ${config.textColor};
      color-scheme: light;
    }
    
    /* Ensure no dark mode is applied to embed */
    #docaider-embed-container.dark {
      color-scheme: light !important;
    }
  `;
  document.head.appendChild(style);

  // Tailwind CSS is now bundled directly into the embed.js file
  // No need to load it externally

  // Add Google Fonts Prompt font
  const fontPreconnect1 = document.createElement("link");
  fontPreconnect1.rel = "preconnect";
  fontPreconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(fontPreconnect1);

  const embedLink = document.createElement("link");
  embedLink.rel = "stylesheet";
  embedLink.href = origin + "/embed.css";
  document.head.appendChild(embedLink);

  const fontPreconnect2 = document.createElement("link");
  fontPreconnect2.rel = "preconnect";
  fontPreconnect2.href = "https://fonts.gstatic.com";
  fontPreconnect2.setAttribute("crossorigin", "");
  document.head.appendChild(fontPreconnect2);

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.setAttribute("defer", "true");
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";
  document.head.appendChild(fontLink);

  // Create a container for the chat widget
  const container = document.createElement("div");
  container.id = "docaider-embed-container";
  document.body.appendChild(container);

  // Set window config for the App component to access
  window.DocaiderChatConfig = config as never;

  // Render the App component into the container
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();
