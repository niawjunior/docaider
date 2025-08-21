(function() {
  // Configuration options with defaults
  const defaultConfig = {
    chatboxTitle: 'AI Assistant',
    primaryColor: '#0091ff',
    position: 'bottom-right',
    width: '350px',
    height: '500px',
    iconSize: '50px',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Ask a question...',
    knowledgeBaseId: null
  };

  // Get script tag attributes
  const scriptTag = document.currentScript;
  const knowledgeBaseId = scriptTag.getAttribute('data-kb-id');
  
  if (!knowledgeBaseId) {
    console.error('Docaider: Missing knowledge base ID. Please add data-kb-id attribute to the script tag.');
    return;
  }

  // Merge default config with script attributes
  const config = {
    ...defaultConfig,
    knowledgeBaseId,
    chatboxTitle: scriptTag.getAttribute('data-title') || defaultConfig.chatboxTitle,
    primaryColor: scriptTag.getAttribute('data-primary-color') || defaultConfig.primaryColor,
    textColor: scriptTag.getAttribute('data-text-color') || '#FFFFFF',
    position: scriptTag.getAttribute('data-position') || defaultConfig.position,
    width: scriptTag.getAttribute('data-width') || defaultConfig.width,
    height: scriptTag.getAttribute('data-height') || defaultConfig.height,
    iconSize: scriptTag.getAttribute('data-icon-size') || defaultConfig.iconSize,
    welcomeMessage: scriptTag.getAttribute('data-welcome-message') || defaultConfig.welcomeMessage,
    buttonText: scriptTag.getAttribute('data-button-text') || 'Chat with AI',
    showButtonText: scriptTag.getAttribute('data-show-button-text') === 'true',
    placeholder: scriptTag.getAttribute('data-placeholder') || defaultConfig.placeholder
  };

  // Create and inject CSS
  const style = document.createElement('style');
  style.textContent = `
    .docaider-chatbox-container {
      position: fixed;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .docaider-chatbox-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }
    .docaider-chatbox-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }
    .docaider-chatbox-container.top-right {
      top: 20px;
      right: 20px;
    }
    .docaider-chatbox-container.top-left {
      top: 20px;
      left: 20px;
    }
    .docaider-chatbox-toggle {
      width: ${config.iconSize};
      height: ${config.iconSize};
      border-radius: 50%;
      background-color: ${config.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
    }
    .docaider-chatbox-toggle:hover {
      transform: scale(1.05);
    }
    .docaider-chatbox {
      display: none;
      width: ${config.width};
      height: ${config.height};
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      flex-direction: column;
      margin-bottom: 10px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    .docaider-chatbox.open {
      display: flex;
    }
    .docaider-chatbox-header {
      padding: 12px 15px;
      background-color: ${config.primaryColor};
      color: white;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .docaider-chatbox-close {
      cursor: pointer;
      font-size: 18px;
    }
    .docaider-chatbox-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      background-color: #f9f9f9;
    }
    .docaider-message {
      margin-bottom: 10px;
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 15px;
      position: relative;
      word-wrap: break-word;
    }
    .docaider-message-user {
      background-color: ${config.primaryColor};
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }
    .docaider-message-bot {
      background-color: #e9e9eb;
      color: black;
      margin-right: auto;
      border-bottom-left-radius: 4px;
    }
    .docaider-chatbox-input {
      display: flex;
      padding: 10px;
      border-top: 1px solid #eaeaea;
    }
    .docaider-chatbox-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    .docaider-chatbox-input button {
      background-color: ${config.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      margin-left: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .docaider-chatbox-input button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .docaider-typing-indicator {
      display: flex;
      padding: 8px 12px;
      background-color: #e9e9eb;
      border-radius: 15px;
      margin-bottom: 10px;
      max-width: 100px;
      margin-right: auto;
      border-bottom-left-radius: 4px;
    }
    .docaider-typing-indicator span {
      height: 8px;
      width: 8px;
      margin: 0 1px;
      background-color: #999;
      border-radius: 50%;
      display: inline-block;
      animation: docaider-typing 1.4s infinite ease-in-out both;
    }
    .docaider-typing-indicator span:nth-child(1) {
      animation-delay: -0.32s;
    }
    .docaider-typing-indicator span:nth-child(2) {
      animation-delay: -0.16s;
    }
    @keyframes docaider-typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .docaider-powered-by {
      text-align: center;
      font-size: 11px;
      padding: 5px;
      color: #999;
    }
    .docaider-powered-by a {
      color: ${config.primaryColor};
      text-decoration: none;
    }
    .docaider-markdown p {
      margin: 0 0 10px 0;
    }
    .docaider-markdown code {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    .docaider-markdown pre {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .docaider-markdown ul, .docaider-markdown ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }
  `;
  document.head.appendChild(style);

  // Create chat container
  const container = document.createElement('div');
  container.className = `docaider-chatbox-container ${config.position}`;
  
  // Create chat toggle button
  const toggleButton = document.createElement('div');
  toggleButton.className = 'docaider-chatbox-toggle';
  
  if (config.showButtonText) {
    toggleButton.style.borderRadius = '20px';
    toggleButton.style.padding = '8px 16px';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.gap = '8px';
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>${config.buttonText || 'Chat with AI'}</span>
    `;
  } else {
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
  }
  
  // Create chatbox
  const chatbox = document.createElement('div');
  chatbox.className = 'docaider-chatbox';
  
  // Create chatbox header
  const header = document.createElement('div');
  header.className = 'docaider-chatbox-header';
  header.innerHTML = `
    <div>${config.chatboxTitle}</div>
    <div class="docaider-chatbox-close">×</div>
  `;
  
  // Create messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'docaider-chatbox-messages';
  
  // Add welcome message
  if (config.welcomeMessage) {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'docaider-message docaider-message-bot';
    welcomeMessage.textContent = config.welcomeMessage;
    messagesContainer.appendChild(welcomeMessage);
  }
  
  // Create input area
  const inputArea = document.createElement('div');
  inputArea.className = 'docaider-chatbox-input';
  inputArea.innerHTML = `
    <input type="text" placeholder="${config.placeholder}" />
    <button type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  `;
  
  // Create powered by footer
  const poweredBy = document.createElement('div');
  poweredBy.className = 'docaider-powered-by';
  poweredBy.innerHTML = 'Powered by <a href="https://docaider.com" target="_blank">Docaider</a>';
  
  // Assemble the chatbox
  chatbox.appendChild(header);
  chatbox.appendChild(messagesContainer);
  chatbox.appendChild(inputArea);
  chatbox.appendChild(poweredBy);
  
  // Add elements to container
  container.appendChild(chatbox);
  container.appendChild(toggleButton);
  
  // Add container to body
  document.body.appendChild(container);
  
  // Get elements
  const closeButton = header.querySelector('.docaider-chatbox-close');
  const input = inputArea.querySelector('input');
  const sendButton = inputArea.querySelector('button');
  
  // Chat state
  let isOpen = false;
  let isWaitingForResponse = false;
  let chatId = null;
  
  // Toggle chat function
  function toggleChat() {
    isOpen = !isOpen;
    chatbox.classList.toggle('open', isOpen);
    
    // If opening for the first time, initialize the chat
    if (isOpen && !chatId) {
      initializeChat();
    }
    
    // Scroll to bottom when opening
    if (isOpen) {
      scrollToBottom();
      input.focus();
    }
  }
  
  // Initialize chat
  async function initializeChat() {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/embed/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          knowledgeBaseId: config.knowledgeBaseId,
          referrer: document.referrer || window.location.href
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize chat');
      }
      
      const data = await response.json();
      chatId = data.chatId;
    } catch (error) {
      console.error('Docaider: Error initializing chat:', error);
      addMessage('Sorry, there was an error connecting to the knowledge base. Please try again later.', 'bot');
    }
  }
  
  // Send message function
  async function sendMessage() {
    const message = input.value.trim();
    if (!message || isWaitingForResponse) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable input while waiting
    isWaitingForResponse = true;
    sendButton.disabled = true;
    
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/embed/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatId,
          knowledgeBaseId: config.knowledgeBaseId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = '';
      
      // Remove typing indicator
      hideTypingIndicator();
      
      // Create bot message element
      const botMessageElement = addMessage('', 'bot');
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        botResponse += chunk;
        
        // Update bot message with accumulated response
        botMessageElement.innerHTML = formatMarkdown(botResponse);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Docaider: Error sending message:', error);
      hideTypingIndicator();
      addMessage('Sorry, there was an error processing your message. Please try again.', 'bot');
    } finally {
      // Re-enable input
      isWaitingForResponse = false;
      sendButton.disabled = false;
      input.focus();
    }
  }
  
  // Add message to chat
  function addMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `docaider-message docaider-message-${sender}`;
    
    if (sender === 'bot') {
      message.classList.add('docaider-markdown');
      message.innerHTML = formatMarkdown(text);
    } else {
      message.textContent = text;
    }
    
    messagesContainer.appendChild(message);
    scrollToBottom();
    return message;
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'docaider-typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }
  
  // Hide typing indicator
  function hideTypingIndicator() {
    const indicator = messagesContainer.querySelector('.docaider-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  // Scroll to bottom of messages
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Simple markdown formatter
  function formatMarkdown(text) {
    if (!text) return '';
    
    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Headers
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Lists
    text = text.replace(/^\s*\n\* (.*)/gm, '<ul>\n<li>$1</li>\n</ul>');
    text = text.replace(/^\s*\n\d+\. (.*)/gm, '<ol>\n<li>$1</li>\n</ol>');
    
    // Fix lists
    text = text.replace(/<\/ul>\s*<ul>/g, '');
    text = text.replace(/<\/ol>\s*<ol>/g, '');
    
    // Paragraphs
    text = text.replace(/^\s*(\n)?(.+)/gm, function(m) {
      return /\<(\/)?(h|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
    });
    
    // Fix multiple paragraphs
    text = text.replace(/<\/p><p>/g, '</p>\n<p>');
    
    return text;
  }
  
  // Event listeners
  toggleButton.addEventListener('click', toggleChat);
  closeButton.addEventListener('click', toggleChat);
  
  sendButton.addEventListener('click', sendMessage);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Expose API
  window.DocaiderChat = {
    open: function() {
      if (!isOpen) toggleChat();
    },
    close: function() {
      if (isOpen) toggleChat();
    },
    toggle: toggleChat
  };
})();
