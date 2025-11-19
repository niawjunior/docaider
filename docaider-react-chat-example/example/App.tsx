import React from "react";
import { ChatWidget } from "../src";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Docaider React Chat Example</h1>
      <p>This is a test page for the React chat widget.</p>

      <div
        style={{
          height: "100vh",
          position: "relative",
          border: "2px solid #ccc",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>Test Content Area</h2>
        <p>The chat widget should appear in the bottom-right corner.</p>

        <ChatWidget
          knowledgeBaseId="eec31a66-feb6-4ba2-bbc9-fe3ecddf2fd9"
          apiEndpoint="http://localhost:3000" // For local development
          position="bottom-right"
          theme={{
            primaryColor: "#6208ff",
            textColor: "#FFFFFF",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
          appearance={{
            width: "350px",
            height: "500px",
            showButtonText: true,
            buttonText: "Chat with AI",
            title: "ถามได้ทุกอย่าง",
          }}
          behavior={{
            welcomeMessage: "Hi there! How can I help you with your questions?",
            inputPlaceholder: "Ask a question...",
            autoOpen: false,
          }}
          onOpen={() => console.log("Chat opened")}
          onClose={() => console.log("Chat closed")}
          onMessageSent={(message) => console.log("Message sent:", message)}
        />
      </div>
    </div>
  );
}

export default App;
