# Embedding Your Knowledge Base on External Websites

This guide explains how to embed your Docaider knowledge base chatbox on any external website.

## Overview

The embedding feature allows you to add an AI-powered chatbot to your website that can answer questions based on your Docaider knowledge base. This is perfect for:

- Adding a smart FAQ assistant to your website
- Providing customer support based on your documentation
- Creating interactive knowledge resources for your users

## Prerequisites

- You must be the owner of the knowledge base
- For private knowledge bases, embedding must be explicitly enabled

## How to Embed Your Knowledge Base

### Step 1: Configure Embedding Settings

1. Navigate to your knowledge base in Docaider
2. Click the "Deploy" button (code icon) in the top right corner
3. In the dialog that appears, toggle "Allow Embedding" to enable embedding
4. Configure the appearance settings:
   - **Primary Color**: The main color for the chatbox button and header
   - **Text Color**: The color of text on the button and header
   - **Position**: Where the chatbox appears on your website (bottom-right, bottom-left, etc.)
   - **Welcome Message**: The initial message users see when opening the chat
   - **Button Text**: Text to display on the chat button (optional)
   - **Show Button Text**: Whether to show text alongside the chat icon

5. Click "Save Changes" to apply your settings

### Step 2: Copy the Embed Code

1. In the same dialog, go to the "Embed Code" tab
2. Copy the generated code snippet

### Step 3: Add to Your Website

Add the copied code snippet to your website's HTML, just before the closing `</body>` tag:

```html
<script 
  src="https://your-docaider-domain.com/embed.js" 
  data-kb-id="your-knowledge-base-id" 
  data-primary-color="#7C3AED" 
  data-position="bottom-right"
  data-welcome-message="Hi there! How can I help you?"
></script>
```

## Customization Options

You can customize the embedded chatbox by modifying the data attributes in the script tag:

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-kb-id` | Your knowledge base ID (required) | - |
| `data-primary-color` | Main color for button and header | `#7C3AED` |
| `data-text-color` | Text color for button and header | `#FFFFFF` |
| `data-position` | Position on screen (`bottom-right`, `bottom-left`, etc.) | `bottom-right` |
| `data-welcome-message` | Initial message shown to users | `Hi there! How can I help you?` |
| `data-button-text` | Text to show on the chat button | `Chat with AI` |
| `data-show-button-text` | Whether to show text on button (`true` or `false`) | `false` |
| `data-title` | Title shown in the chatbox header | `Docaider Chat` |
| `data-width` | Width of the chatbox in pixels | `350` |
| `data-height` | Height of the chatbox in pixels | `500` |

## Testing Your Embedded Chatbox

To test your embedded chatbox:

1. Visit `/test-embed.html` on your Docaider instance
2. Enter your knowledge base ID when prompted
3. The test page will load with your embedded chatbox
4. Click the "Run Embedded Chatbox Test" button to run automated tests

## Security Considerations

- Embedding is only allowed for knowledge base owners
- Private knowledge bases require explicit permission to be embedded
- All API requests are validated to ensure proper authorization
- Embedding access is logged for security monitoring

## Troubleshooting

If your embedded chatbox isn't working:

1. Ensure the knowledge base ID is correct
2. Check that embedding is enabled for your knowledge base
3. Verify that your website allows loading external scripts
4. Check browser console for any error messages

## Usage Limitations

- Embedded chatboxes are subject to the same usage limits as your Docaider account
- High traffic websites may require a premium plan for optimal performance

## Support

If you encounter issues with the embedding feature, please contact support or open an issue on our GitHub repository.
