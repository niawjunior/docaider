# Testing the Refactored EmbedChatBox Component

## Prerequisites

1. Install the required dependencies:
   ```bash
   npm install @ai-sdk/react ai
   ```

## Testing Steps

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the demo page**:
   Navigate to `http://localhost:5173` (or whatever port Vite is using)

3. **Test the chat functionality**:
   - Click the chat button to open the chat widget
   - Verify that the welcome message appears
   - Send a test message and check if the response streams correctly
   - Test error handling by temporarily modifying the API endpoint URL to an invalid one

4. **Test the UI components**:
   - Verify that the chat opens and closes correctly
   - Check that messages scroll properly
   - Test the stop button during streaming
   - Verify that the input field is disabled during streaming

## Build and Integration Testing

1. **Build the embed script**:
   ```bash
   npm run build
   ```

2. **Test with the demo HTML page**:
   - Copy the built `embed.js` to the main project's public folder
   - Open `/public/demo.html` in a browser
   - Verify that the embed script loads and initializes correctly
   - Test the chat functionality as described above

## Troubleshooting

If you encounter issues:

1. **Check browser console for errors**
2. **Verify API endpoints are accessible**:
   - `/api/embed/initialize`
   - `/api/embed/chat`
3. **Confirm CORS headers are properly set** in the Next.js API routes
4. **Verify the knowledge base ID** is valid and accessible
