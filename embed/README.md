# Docaider Embed Widget

[![npm version](https://img.shields.io/npm/v/docaider-embed.svg)](https://www.npmjs.com/package/docaider-embed)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/Website-docaider.com-blue)](https://www.docaider.com)

The official AI-powered chat widget for **[Docaider](https://www.docaider.com)**. Seamlessly integrate a smart knowledge base assistant into your website with a few lines of code.

Compatible with **HTML**, **React**, **Vue**, and any other framework.

## ✨ Features

- 🤖 **AI-Powered**: Instant answers from your knowledge base.
- 🎨 **Customizable**: Control colors, position, and branding.
- ⚛️ **Framework Agnostic**: First-class support for React and Vue.
- 🛡️ **Shadow DOM**: Styles are isolated and won't conflict with your site.
- 📱 **Responsive**: Optimized for desktop and mobile.
- 🎮 **Control API**: Open, close, and interact programmatically.

---

## 🚀 Quick Start (HTML)

The fastest way to get started is using the pre-built script. Add this to your `<body>` tag:

```html
<script 
  src="https://unpkg.com/docaider-embed/dist/embed.js"
  data-kb-id="YOUR_KNOWLEDGE_BASE_ID"
  data-title="AI Assistant"
  data-theme="blue"
  data-position="bottom-right">
</script>
```

That's it! The widget will appear on your site.

---

## 📦 Installation (NPM)

For React, Vue, or modern JavaScript applications:

```bash
npm install docaider-embed
# or
yarn add docaider-embed
# or
pnpm add docaider-embed
```

---

## ⚛️ React Usage

Import the component and use it in your app. Styles are injected automatically.

```tsx
import { useRef } from "react";
import { EmbedChatBox, type EmbedChatBoxRef } from "docaider-embed";

function App() {
  const chatRef = useRef<EmbedChatBoxRef>(null);

  return (
    <>
      <button onClick={() => chatRef.current?.open()}>
        Open Chat
      </button>

      <EmbedChatBox 
        ref={chatRef}
        knowledgeBaseId="YOUR_KNOWLEDGE_BASE_ID"
        // Optional: Override the default API endpoint
        src="https://your-docaider-instance.com" 
        theme="blue"
        position="bottom-right"
      />
    </>
  );
}
```

---

## 🟢 Vue Usage

We provide a dedicated Vue plugin and composable for the best developer experience.

### 1. Global Registration (Recommended)

Register the plugin in your `main.ts`:

```typescript
import { createApp } from "vue";
import App from "./App.vue";
import { DocaiderEmbed } from "docaider-embed/vue";

const app = createApp(App);
app.use(DocaiderEmbed);
app.mount("#app");
```

Then use the component anywhere:

```vue
<template>
  <VueEmbedChatBox
    knowledgeBaseId="YOUR_KNOWLEDGE_BASE_ID"
    theme="green"
  />
</template>
```

### 2. Programmatic Control (Composable)

Control the widget from **any component** (even without a ref) using `useDocaiderEmbed`:

```vue
<script setup lang="ts">
import { useDocaiderEmbed } from "docaider-embed/vue";

// Control the global chat instance
const { 
  open, 
  close, 
  toggle, 
  setWelcomeMessage, 
  setMessage,
  sendMessage,
  useTool,
  useKnowledge 
} = useDocaiderEmbed();

const openSupport = () => {
  setWelcomeMessage("Hi! How can I help you with billing today?");
  open();
};

const closeChat = () => {
  close();
};

const toggleChat = () => {
  toggle();
};

const prefillInput = () => {
  setMessage("I have a question about...");
  open();
};

const autoSendMessage = () => {
  sendMessage("What are your business hours?");
};

const correctGrammar = () => {
  useTool("context", { 
    prompt: "Correct Grammar", 
    content: "I go to schol today" 
  });
  open();
};

const injectContext = () => {
  // Inject custom data for the AI to use
  useKnowledge("User Profile", { 
    name: "John Doe", 
    plan: "Premium" 
  });
  
  // Or clear context
  // useKnowledge(null);
};
</script>

<template>
  <div class="buttons">
    <button @click="openSupport">Open Support</button>
    <button @click="closeChat">Close</button>
    <button @click="toggleChat">Toggle</button>
    <button @click="prefillInput">Prefill Input</button>
    <button @click="autoSendMessage">Ask Question</button>
    <button @click="correctGrammar">Fix Grammar</button>
    <button @click="injectContext">Inject Data</button>
  </div>
</template>
```

---

## 📚 API Reference

### Props / Attributes

| Prop (React/Vue) | Attribute (HTML) | Type | Default | Description |
|------------------|------------------|------|---------|-------------|
| `knowledgeBaseId` | `data-kb-id` | `string` | **Required** | Your Docaider Knowledge Base ID |
| `src` | `src` | `string` | `undefined` | Custom Docaider instance URL (if self-hosted) |
| `chatId` | `data-chat-id` | `string` | `undefined` | Unique identifier for the chat session |
| `chatboxTitle` | `data-title` | `string` | `"AI Assistant"` | Title displayed in the header |
| `position` | `data-position` | `string` | `"bottom-right"` | `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `theme` | `data-theme` | `string` | `"blue"` | `blue`, `gray`, `green`, `orange`, `purple` |
| `welcomeMessage` | `data-welcome-message` | `string` | `"Hello..."` | Initial message bubble text |
| `placeholder` | `data-placeholder` | `string` | `"Ask a question..."` | Input field placeholder |
| `width` | `data-width` | `string` | `"350px"` | Width of the chat window |
| `height` | `data-height` | `string` | `"500px"` | Height of the chat window |
| `logo` | `data-logo` | `string` | `undefined` | URL to a custom logo image |
| `documents` | `data-documents` | `{ title: string }[]` | `[]` | List of available documents to show in file list |
| `onRefresh` | - | `() => void` | `undefined` | Callback when refresh button is clicked |
| `positionStrategy` | `data-position-strategy` | `"fixed" \| "absolute"` | `"fixed"` | Positioning strategy for the chat window |
| `initialSuggestions` | `data-initial-suggestions` | `string[]` | `[]` | Initial quick suggestions to display |

### Instance Methods

Methods available on the ref (React/Vue) or `window.Docaider` (HTML):

- **`open()`**: Opens the chat window.
- **`close()`**: Closes the chat window.
- **`toggle()`**: Toggles the open/closed state.
- **`setWelcomeMessage(msg: string)`**: Updates the welcome message bubble immediately.
- **`setMessage(msg: string)`**: Sets the text in the input field.
- **`sendMessage(msg: string)`**: Programmatically sends a message as the user.
- **`useTool(tool: string, options?: { content?: string; prompt?: string })`**: Programmatically triggers a specific tool or action.
  - `tool`: "context" | "readCurrentPage" | "knowledge-base" | "auto" | "askQuestion"
  - `options`: Optional parameters for the tool (e.g., `{ prompt: "Correct Grammar", content: "Text to correct" }`)
- **`useKnowledge(nameOrContext: string | any, content?: any)`**: Programmatically sets or clears knowledge context.
  - **Set Default Context**: `useKnowledge({ foo: "bar" })`
  - **Set Named Context**: `useKnowledge("My Context", { foo: "bar" })`
  - **Clear Context**: `useKnowledge(null)` or `useKnowledge("My Context", null)`

---

## 🔗 Links

- **Website**: [https://www.docaider.com](https://www.docaider.com)
- **Documentation**: [https://docs.docaider.com](https://docs.docaider.com)
- **NPM Package**: [https://www.npmjs.com/package/docaider-embed](https://www.npmjs.com/package/docaider-embed)

---

## License

MIT © [Docaider](https://www.docaider.com)
