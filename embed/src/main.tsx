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
    position: scriptTag.getAttribute("data-position") || "bottom-right",
    welcomeMessage:
      scriptTag.getAttribute("data-welcome-message") ||
      "Hello! How can I help you today?",
    height: scriptTag.getAttribute("data-height") || "500px",
    width: scriptTag.getAttribute("data-width") || "350px",
    chatboxTitle: scriptTag.getAttribute("data-title") || "AI Assistant",
    theme: (scriptTag.getAttribute("data-theme") as any) || "blue",
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

  // Tailwind CSS is now bundled directly into the embed.js file
  // No need to load it externally

  // Add Google Fonts Nunito font
  const fontPreconnect1 = document.createElement("link");
  fontPreconnect1.rel = "preconnect";
  fontPreconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(fontPreconnect1);

  const fontPreconnect2 = document.createElement("link");
  fontPreconnect2.rel = "preconnect";
  fontPreconnect2.href = "https://fonts.gstatic.com";
  fontPreconnect2.setAttribute("crossorigin", "");
  document.head.appendChild(fontPreconnect2);

  // Create a Shadow DOM host for complete CSS isolation
  const shadowHost = document.createElement("div");
  shadowHost.id = "docaider-embed-container";
  document.body.appendChild(shadowHost);

  // Create shadow root for complete isolation
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  // Set CSS variables for dynamic colors - scoped to shadow DOM only
  const style = document.createElement("style");
  style.textContent = `
    /* Scoped CSS variables for Docaider embed - won't affect host website */
    :host {
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --border: oklch(0.922 0 0);
      --input: oklch(0.922 0 0);
      --muted: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --accent: oklch(0.97 0 0);
      --accent-foreground: oklch(0.205 0 0);
      --radius: 0.625rem;
      color-scheme: light;
      all: initial;
      font-family: var(--font-nunito), sans-serif;
    }
    
    /* Ensure no dark mode is applied to embed */
    :host.dark {
      color-scheme: light !important;
    }
    
    /* Reset all elements inside shadow DOM */
    * {
      box-sizing: border-box;
      font-family: var(--font-nunito), sans-serif;
    }
  `;
  shadowRoot.appendChild(style);

  // Create container inside shadow root
  const container = document.createElement("div");
  container.id = "shadow-container";
  container.classList.add("docaider-embed");
  shadowRoot.appendChild(container);

  // Load CSS inside shadow DOM
  const embedLink = document.createElement("link");
  embedLink.rel = "stylesheet";
  embedLink.href = origin + "/embed.css";
  shadowRoot.appendChild(embedLink);

  // Load Google Fonts inside shadow DOM
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
  shadowRoot.appendChild(fontLink);

  // Set window config for the App component to access
  window.DocaiderChatConfig = config as never;

  // Render the App component into the shadow container
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();
