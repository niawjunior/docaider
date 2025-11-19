# Docaider React Chat Widget

A React component library for integrating Docaider AI chat widgets into React applications.

## Installation

```bash
npm install docaider-react-chat
# or
yarn add docaider-react-chat
# or
pnpm add docaider-react-chat
```

## Quick Start

```tsx
import React from "react";
import { ChatWidget } from "docaider-react-chat";

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <ChatWidget knowledgeBaseId="your-knowledge-base-id" />
    </div>
  );
}

export default App;
```

## Advanced Usage

```tsx
import React from "react";
import { ChatWidget } from "docaider-react-chat";

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <ChatWidget
        knowledgeBaseId="your-knowledge-base-id"
        apiEndpoint="https://your-api.com"
        position="bottom-left"
        theme={{
          primaryColor: "#7C3AED",
          textColor: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
        }}
        appearance={{
          width: "400px",
          height: "600px",
          showButtonText: true,
          buttonText: "Chat with Support",
          title: "Support Assistant",
        }}
        behavior={{
          welcomeMessage: "Hello! How can I help you today?",
          inputPlaceholder: "Ask me anything...",
          autoOpen: false,
        }}
        onOpen={() => console.log("Chat opened")}
        onClose={() => console.log("Chat closed")}
        onMessageSent={(message) => console.log("Message sent:", message)}
      />
    </div>
  );
}

export default App;
```

## Props

### ChatWidgetProps

| Prop              | Type                                                           | Default                  | Description                                        |
| ----------------- | -------------------------------------------------------------- | ------------------------ | -------------------------------------------------- |
| `knowledgeBaseId` | `string`                                                       | (required)               | Your Docaider knowledge base ID                    |
| `apiEndpoint`     | `string`                                                       | `window.location.origin` | API endpoint for chat initialization and messaging |
| `position`        | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'`         | Position of the chat widget on the screen          |
| `theme`           | `ThemeConfig`                                                  | `{}`                     | Custom theme configuration                         |
| `appearance`      | `AppearanceConfig`                                             | `{}`                     | Widget appearance configuration                    |
| `behavior`        | `BehaviorConfig`                                               | `{}`                     | Widget behavior configuration                      |
| `onOpen`          | `() => void`                                                   | `undefined`              | Callback when chat is opened                       |
| `onClose`         | `() => void`                                                   | `undefined`              | Callback when chat is closed                       |
| `onMessageSent`   | `(message: string) => void`                                    | `undefined`              | Callback when a message is sent                    |

### ThemeConfig

| Prop           | Type     | Default                                  | Description                                 |
| -------------- | -------- | ---------------------------------------- | ------------------------------------------- |
| `primaryColor` | `string` | `'#0091ff'`                              | Primary color for buttons and user messages |
| `textColor`    | `string` | `'#FFFFFF'`                              | Text color for buttons and user messages    |
| `fontFamily`   | `string` | `'system-ui, -apple-system, sans-serif'` | Font family for the widget                  |

### AppearanceConfig

| Prop             | Type      | Default          | Description                                 |
| ---------------- | --------- | ---------------- | ------------------------------------------- |
| `width`          | `string`  | `'350px'`        | Width of the chat window                    |
| `height`         | `string`  | `'500px'`        | Height of the chat window                   |
| `iconSize`       | `string`  | `'50px'`         | Size of the chat button when text is hidden |
| `showButtonText` | `boolean` | `false`          | Whether to show text on the chat button     |
| `buttonText`     | `string`  | `'Chat with AI'` | Text displayed on the chat button           |
| `title`          | `string`  | `'AI Assistant'` | Title displayed in the chat header          |

### BehaviorConfig

| Prop               | Type      | Default                              | Description                                    |
| ------------------ | --------- | ------------------------------------ | ---------------------------------------------- |
| `welcomeMessage`   | `string`  | `'Hello! How can I help you today?'` | Initial message from the assistant             |
| `inputPlaceholder` | `string`  | `'Ask a question...'`                | Placeholder text for the input field           |
| `autoOpen`         | `boolean` | `false`                              | Whether to automatically open the chat on load |

## Individual Components

You can also use individual components if you need more control:

```tsx
import { ChatWindow, ChatButton, useDocaiderChat } from "docaider-react-chat";

function CustomChatWidget() {
  const { isOpen, messages, isLoading, toggleChat, sendMessage } =
    useDocaiderChat(config);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={null}
          status="ready"
          config={config}
          onClose={toggleChat}
          onSendMessage={sendMessage}
          onStop={() => {}}
        />
      )}
      <ChatButton isOpen={isOpen} config={config} onToggle={toggleChat} />
    </div>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run in watch mode for development
npm run dev

# Type checking
npm run type-check
```

## License

MIT © Docaider Team
