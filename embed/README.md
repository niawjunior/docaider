# docaider-embed

The official embed chat widget for Docaider. Easily add an AI-powered chat widget to your website, compatible with HTML, React, and Vue.

## Features

- 🤖 AI-powered chat interface
- 🎨 Customizable theme and colors
- 📦 Lightweight and easy to integrate
- ⚛️ React and Vue support
- 🛡️ Shadow DOM style isolation
- 🎮 Programmatic control API

## Installation

```bash
npm install docaider-embed
```

## Usage

### 1. HTML (Script Tag)

Add the following script tag to your HTML page. The widget will automatically initialize.

```html
<script 
  src="https://unpkg.com/docaider-embed/dist/embed.js"
  data-kb-id="YOUR_KNOWLEDGE_BASE_ID"
  data-title="AI Assistant"
  data-position="bottom-right">
</script>
```

#### Global API

You can control the widget programmatically using the global `window.Docaider` object:

```javascript
// Open the chat
window.Docaider.open();

// Close the chat
window.Docaider.close();

// Toggle the chat
window.Docaider.toggle();

// Set the welcome message bubble
window.Docaider.setWelcomeMessage("Hello! How can I help?");

// Set the input field text
window.Docaider.setMessage("I have a question about pricing");

// Send a message programmatically
window.Docaider.sendMessage("What are your pricing plans?");
```

### 2. React

Import the `EmbedChatBox` component. Styles are injected automatically via Shadow DOM.

```tsx
import { useRef } from "react";
import { EmbedChatBox, type EmbedChatBoxRef } from "docaider-embed";

function App() {
  const chatRef = useRef<EmbedChatBoxRef>(null);

  return (
    <>
      <button onClick={() => chatRef.current?.open()}>Open Chat</button>
      
      <EmbedChatBox 
        ref={chatRef}
        knowledgeBaseId="YOUR_KNOWLEDGE_BASE_ID"
        src="https://your-docaider-instance.com"
      />
    </>
  );
}
```

### 3. Vue

Import the `VueEmbedChatBox` component.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VueEmbedChatBox } from 'docaider-embed/vue';

const chatRef = ref();

const openChat = () => {
  chatRef.value?.open();
};
</script>

<template>
  <button @click="openChat">Open Chat</button>
  
  <VueEmbedChatBox
    ref="chatRef"
    knowledgeBaseId="YOUR_KNOWLEDGE_BASE_ID"
    src="https://your-docaider-instance.com"
  />
</template>
```

## Props / Attributes

| Prop (React/Vue) | Attribute (HTML) | Type | Default | Description |
|------------------|------------------|------|---------|-------------|
| `knowledgeBaseId` | `data-kb-id` | `string` | **Required** | Your Docaider Knowledge Base ID |
| `src` | `src` (origin) | `string` | **Required** | URL of your Docaider instance |
| `chatboxTitle` | `data-title` | `string` | "AI Assistant" | Title in the chat header |
| `position` | `data-position` | `string` | "bottom-right" | "bottom-right", "bottom-left", "top-right", "top-left" |
| `theme` | `data-theme` | `string` | "blue" | "blue", "gray", "green" |
| `welcomeMessage` | `data-welcome-message` | `string` | "Hello..." | Initial message bubble |
| `placeholder` | `data-placeholder` | `string` | "Ask a question..." | Input placeholder text |
| `width` | `data-width` | `string` | "350px" | Width of the chat window |
| `height` | `data-height` | `string` | "500px" | Height of the chat window |


## License

MIT
