/**
 * Test script for the Docaider embedded chatbox
 * This script helps verify that the embedded chatbox is working correctly
 */

// Function to test the embedded chatbox
function testEmbeddedChatbox(knowledgeBaseId) {
  console.log('🧪 Starting embedded chatbox test');
  console.log(`📚 Testing with knowledge base ID: ${knowledgeBaseId}`);

  // Test 1: Check if the embed.js script is loaded
  const embedScript = document.querySelector('script[src*="embed.js"]');
  console.log(`✅ Test 1: embed.js script loaded: ${!!embedScript}`);

  // Test 2: Check if the chatbox container is created
  const chatboxContainer = document.querySelector('.docaider-chatbox-container');
  console.log(`✅ Test 2: Chatbox container created: ${!!chatboxContainer}`);

  // Test 3: Check if the toggle button is created
  const toggleButton = document.querySelector('.docaider-chatbox-toggle');
  console.log(`✅ Test 3: Toggle button created: ${!!toggleButton}`);

  // Test 4: Check if the chatbox is created
  const chatbox = document.querySelector('.docaider-chatbox');
  console.log(`✅ Test 4: Chatbox created: ${!!chatbox}`);

  // Test 5: Test opening the chatbox
  console.log('🔄 Test 5: Opening chatbox...');
  if (toggleButton) {
    toggleButton.click();
    setTimeout(() => {
      const isOpen = chatbox.classList.contains('open');
      console.log(`✅ Test 5: Chatbox opened: ${isOpen}`);
      
      // Test 6: Check if the input field is created
      const inputField = document.querySelector('.docaider-chatbox-input input');
      console.log(`✅ Test 6: Input field created: ${!!inputField}`);
      
      // Test 7: Check if the send button is created
      const sendButton = document.querySelector('.docaider-chatbox-input button');
      console.log(`✅ Test 7: Send button created: ${!!sendButton}`);
      
      // Test 8: Check if the welcome message is displayed
      const welcomeMessage = document.querySelector('.docaider-message-bot');
      console.log(`✅ Test 8: Welcome message displayed: ${!!welcomeMessage}`);
      
      // Test 9: Test sending a message
      console.log('🔄 Test 9: Sending test message...');
      if (inputField && sendButton) {
        inputField.value = 'Test message from automated test';
        sendButton.click();
        
        // Wait for the response
        setTimeout(() => {
          const userMessage = document.querySelector('.docaider-message-user');
          console.log(`✅ Test 9: User message sent: ${!!userMessage}`);
          
          // Test 10: Check if we get a response
          setTimeout(() => {
            const botResponses = document.querySelectorAll('.docaider-message-bot');
            const gotResponse = botResponses.length > 1; // More than just the welcome message
            console.log(`✅ Test 10: Bot response received: ${gotResponse}`);
            
            console.log('🎉 Embedded chatbox test completed!');
          }, 5000); // Wait 5 seconds for bot response
        }, 1000);
      }
    }, 1000);
  }
}

// Add a button to run the test
window.addEventListener('DOMContentLoaded', () => {
  const testButton = document.createElement('button');
  testButton.textContent = 'Run Embedded Chatbox Test';
  testButton.style.position = 'fixed';
  testButton.style.top = '10px';
  testButton.style.right = '10px';
  testButton.style.padding = '10px';
  testButton.style.backgroundColor = '#7C3AED';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '5px';
  testButton.style.cursor = 'pointer';
  
  testButton.addEventListener('click', () => {
    // Get the knowledge base ID from the embed script
    const embedScript = document.querySelector('script[src*="embed.js"]');
    if (embedScript) {
      const knowledgeBaseId = embedScript.getAttribute('data-kb-id');
      testEmbeddedChatbox(knowledgeBaseId);
    } else {
      console.error('❌ Embed script not found. Make sure to add the embed script first.');
    }
  });
  
  document.body.appendChild(testButton);
});
