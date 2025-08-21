# Embedded Chatbox Testing Checklist

Use this checklist to verify that the embedded chatbox functionality works correctly.

## Prerequisites
- [ ] Development server is running
- [ ] You have a knowledge base ID for testing
- [ ] Knowledge base has documents uploaded
- [ ] Knowledge base has embedding enabled

## Configuration Testing
- [ ] Open a knowledge base as the owner
- [ ] Click the Deploy button to open the EmbedDialog
- [ ] Toggle "Allow Embedding" on/off works correctly
- [ ] Color pickers for primary and text colors work
- [ ] Position dropdown works (bottom-right, bottom-left, etc.)
- [ ] Welcome message input works
- [ ] Button text input works
- [ ] Show button text toggle works
- [ ] Save button successfully updates settings
- [ ] Toast notification appears on successful save
- [ ] Copy button in Embed Code tab copies the code to clipboard
- [ ] Toast notification appears on successful copy

## Test Page Testing
- [ ] Navigate to `/test-embed.html`
- [ ] Enter a valid knowledge base ID when prompted
- [ ] Chatbox button appears in the specified position
- [ ] Button has the correct color and text as configured
- [ ] Click the button to open the chatbox
- [ ] Chatbox opens with the correct welcome message
- [ ] Chatbox has the correct width and height
- [ ] Type a message and send it
- [ ] Message appears in the chat
- [ ] AI responds with relevant information from the knowledge base
- [ ] Click the "Run Embedded Chatbox Test" button
- [ ] Check browser console for test results
- [ ] All tests should pass

## API Testing
- [ ] Initialize endpoint (`/api/embed/initialize`) returns a valid chat ID
- [ ] Chat endpoint (`/api/embed/chat`) accepts messages and returns responses
- [ ] Private knowledge bases without embedding enabled reject API requests
- [ ] Public knowledge bases allow API requests
- [ ] Private knowledge bases with embedding enabled allow API requests

## Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile devices

## Security Testing
- [ ] Verify that embedding only works with valid knowledge base IDs
- [ ] Verify that embedding only works for knowledge bases that are public or have embedding enabled
- [ ] Check that API requests are properly validated
- [ ] Ensure that embedding logs are properly created

## Performance Testing
- [ ] Chatbox loads quickly
- [ ] Responses are streamed in real-time
- [ ] UI remains responsive during AI processing
- [ ] Multiple chat sessions work correctly

## Edge Cases
- [ ] Test with very long messages
- [ ] Test with empty messages (should be prevented)
- [ ] Test with knowledge bases that have no documents
- [ ] Test with invalid knowledge base IDs
- [ ] Test with network interruptions

## Deployment Testing
- [ ] Test on an actual external website
- [ ] Verify that CORS settings allow the embed script to work
- [ ] Check that the embed script loads correctly from different domains
