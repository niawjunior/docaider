# Docaider Embed Chat Widget

## Overview

The Docaider Embed Chat Widget allows you to easily add an AI-powered chat widget to your website with a single script tag. The widget connects to your Docaider knowledge base and provides an intuitive chat interface for your users to ask questions about your content.

## Quick Start

Add the following script tag to your HTML page:

```html
<script 
  src="https://your-domain.com/embed.js"
  data-kb-id="your-knowledge-base-id"
  data-title="AI Assistant">
</script>
```

That's it! The chat widget will appear as a floating button in the bottom right corner of your page.

## Configuration Options

All configuration is done via data attributes on the script tag. Here are all available options:

| Attribute | Description | Default Value |
|-----------|-------------|---------------|
| `data-kb-id` | **Required.** Your Docaider knowledge base ID | - |
| `data-title` | Title displayed in the chat header | "AI Assistant" |
| `data-primary-color` | Primary color for buttons and user messages | "#0091ff" |
| `data-text-color` | Text color for buttons and user messages | "#FFFFFF" |
| `data-position` | Position of the chat widget | "bottom-right" |
| `data-width` | Width of the chat window | "350px" |
| `data-height` | Height of the chat window | "500px" |
| `data-welcome-message` | Initial message from the assistant | "Hello! How can I help you today?" |
| `data-placeholder` | Placeholder text for the input field | "Ask a question..." |
| `data-button-text` | Text displayed on the chat button | "Chat with AI" |
| `data-show-button-text` | Whether to show text on the chat button | "false" |

### Position Options

The `data-position` attribute accepts the following values:
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

## Example with All Options

```html
<script 
  src="https://your-domain.com/embed.js"
  data-kb-id="your-knowledge-base-id"
  data-title="Docaider Assistant"
  data-primary-color="#7C3AED"
  data-position="bottom-right"
  data-width="350px"
  data-height="500px"
  data-welcome-message="Hello! How can I help you with your documents today?"
  data-placeholder="Ask me anything..."
  data-button-text="Chat with Docaider"
  data-show-button-text="false"
  data-text-color="#FFFFFF">
</script>
```

## Development

This project uses Vite for building the embed script. The build process creates a standalone UMD bundle that includes all dependencies (React, ReactDOM, etc.).

### Dependencies

This project requires the following key dependencies:

```bash
# Core dependencies
npm install @ai-sdk/react ai
```

- `@ai-sdk/react`: Provides the useChat hook for managing chat state and streaming
- `ai`: Provides DefaultChatTransport for API integration

### Build Commands

```bash
# Install dependencies
npm install

# Build the embed script
npm run build
```

The build will output `embed.js` to the `/public` folder.
