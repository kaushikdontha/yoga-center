// Message types
const MESSAGE_TYPES = {
  EMBED: 'embed',
  IFRAME_READY: 'iframe-ready',
  ERROR: 'error'
};

// List of known third-party scripts that may cause benign errors
const KNOWN_THIRD_PARTY_SCRIPTS = [
  'load_embeds.js',
  'embed_script.js',
  'iframe_api.js',
  'twitter.js',
  'twitter-widgets.js',
  'platform.twitter.com'
];

// List of known benign error messages
const BENIGN_ERRORS = [
  'message port closed',
  'twitter',
  'Object tweets',
  'Failed to load tweets'
];

// Message handler service
class MessageHandler {
  constructor() {
    this.ports = new Map();
    this.handlers = new Map();
    this.pendingResponses = new Map();
    this.isInitialized = false;
    this.timeout = 30000; // 30 seconds timeout for async responses
    this.initializeErrorHandling();
  }

  init() {
    if (this.isInitialized) return;

    // Handle messages from iframes/embeds
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Handle beforeunload to cleanup ports
    window.addEventListener('beforeunload', this.cleanup.bind(this));

    this.isInitialized = true;
    console.log('MessageHandler initialized');
  }

  initializeErrorHandling() {
    // Global error handler for third-party script errors
    window.addEventListener('error', (event) => {
      if (this.isThirdPartyError(event) || this.isBenignError(event)) {
        event.preventDefault();
        return false;
      }
    }, true);

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isBenignError(event)) {
        event.preventDefault();
        return false;
      }
    });

    // Handle postMessage events
    window.addEventListener('message', (event) => {
      this.handlePostMessage(event);
    });
  }

  isThirdPartyError(event) {
    if (!event.filename) return false;
    return KNOWN_THIRD_PARTY_SCRIPTS.some(script => 
      event.filename.toLowerCase().includes(script.toLowerCase())
    );
  }

  isBenignError(event) {
    const errorText = event.message || event.reason?.message || event.reason || '';
    return BENIGN_ERRORS.some(error => 
      errorText.toLowerCase().includes(error.toLowerCase())
    );
  }

  async handleMessage(event) {
    try {
      // Verify origin
      if (!this.isValidOrigin(event.origin)) {
        console.warn('Message received from unauthorized origin:', event.origin);
        return;
      }

      const data = event.data;
      const messageId = data.messageId || Date.now().toString();
      
      console.log('Received message:', { 
        id: messageId,
        type: data.type, 
        data 
      });

      // Handle MessagePort communication
      if (data.type === 'port') {
        await this.handlePortMessage(event, messageId);
        return;
      }

      // Create response promise
      const responsePromise = new Promise((resolve, reject) => {
        this.pendingResponses.set(messageId, { resolve, reject });

        // Set timeout
        setTimeout(() => {
          if (this.pendingResponses.has(messageId)) {
            const { reject } = this.pendingResponses.get(messageId);
            reject(new Error('Response timeout'));
            this.pendingResponses.delete(messageId);
          }
        }, this.timeout);
      });

      // Handle regular messages
      const handler = this.handlers.get(data.type);
      if (handler) {
        try {
          const response = await Promise.resolve(handler(data, event));
          
          // If handler returned a response, send it back
          if (response !== undefined) {
            this.sendResponse(event.source, messageId, response);
          }
          
          // Resolve the promise
          const pending = this.pendingResponses.get(messageId);
          if (pending) {
            pending.resolve(response);
            this.pendingResponses.delete(messageId);
          }
        } catch (error) {
          console.error('Error in message handler:', error);
          this.sendError(event.source, messageId, error);
          
          // Reject the promise
          const pending = this.pendingResponses.get(messageId);
          if (pending) {
            pending.reject(error);
            this.pendingResponses.delete(messageId);
          }
        }
      } else {
        console.log('No handler for message type:', data.type);
      }

      return responsePromise;
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  async handlePortMessage(event, messageId) {
    try {
      if (event.ports && event.ports[0]) {
        const port = event.ports[0];
        const portId = messageId;
        
        // Store port
        this.ports.set(portId, port);
        
        // Create message channel for responses
        const channel = new MessageChannel();
        
        // Setup port message handler
        port.onmessage = async (e) => {
          try {
            console.log('Port message received:', e.data);
            
            // Handle port-specific messages
            const handler = this.handlers.get(e.data.type);
            if (handler) {
              const response = await Promise.resolve(handler(e.data, { port, portId }));
              
              // Send response through the channel
              if (response !== undefined) {
                channel.port1.postMessage({
                  type: 'response',
                  messageId: e.data.messageId,
                  data: response
                });
              }
            }
          } catch (error) {
            console.error('Error handling port message:', error);
            channel.port1.postMessage({
              type: 'error',
              messageId: e.data.messageId,
              error: error.message
            });
          }
        };

        // Handle port errors
        port.onmessageerror = (error) => {
          console.error('Port message error:', error);
          this.handlePortError(portId, error);
        };

        // Start the port and channel
        port.start();
        channel.port1.start();
        
        // Send acknowledgment with the response channel
        port.postMessage(
          { type: 'connected', portId },
          [channel.port2]
        );
      }
    } catch (error) {
      console.error('Error handling port message:', error);
      this.handlePortError(messageId, error);
    }
  }

  handlePortError(portId, error) {
    try {
      const port = this.ports.get(portId);
      if (port) {
        // Close the port
        port.close();
        this.ports.delete(portId);
        
        // Notify any pending responses
        const pending = this.pendingResponses.get(portId);
        if (pending) {
          pending.reject(error);
          this.pendingResponses.delete(portId);
        }
      }
    } catch (err) {
      console.error('Error handling port error:', err);
    }
  }

  sendResponse(target, messageId, data) {
    try {
      target.postMessage({
        type: 'response',
        messageId,
        data
      }, '*');
    } catch (error) {
      console.error('Error sending response:', error);
      this.sendError(target, messageId, error);
    }
  }

  sendError(target, messageId, error) {
    try {
      target.postMessage({
        type: 'error',
        messageId,
        error: error.message
      }, '*');
    } catch (err) {
      console.error('Error sending error response:', err);
    }
  }

  handlePostMessage(event) {
    try {
      // Ignore messages without data
      if (!event.data) return;

      // Handle different message types
      const { type, data } = event.data;

      switch (type) {
        case MESSAGE_TYPES.EMBED:
          this.handleEmbedMessage(data);
          break;
        case MESSAGE_TYPES.IFRAME_READY:
          this.handleIframeReady(data);
          break;
        case MESSAGE_TYPES.ERROR:
          this.handleErrorMessage(data);
          break;
        default:
          // Ignore unknown message types
          break;
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('Error handling postMessage:', error);
      }
    }
  }

  handleEmbedMessage(data) {
    // Suppress console output for embed messages
    if (process.env.NODE_ENV === 'development') {
      console.debug('Embed message handled:', data);
    }
  }

  handleIframeReady(data) {
    const handler = this.handlers.get(MESSAGE_TYPES.IFRAME_READY);
    if (handler) {
      handler(data);
    }
  }

  handleErrorMessage(data) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Error message from iframe:', data);
    }
  }

  registerHandler(type, handler) {
    this.handlers.set(type, handler);
    console.log('Registered handler for:', type);
  }

  unregisterHandler(type) {
    this.handlers.delete(type);
    console.log('Unregistered handler for:', type);
  }

  sendMessage(type, data, target = window.parent) {
    return new Promise((resolve, reject) => {
      try {
        const messageId = Date.now().toString();
        
        // Store the promise handlers
        this.pendingResponses.set(messageId, { resolve, reject });
        
        // Send the message
        target.postMessage({
          type,
          messageId,
          ...data
        }, '*');
        
        // Set timeout
        setTimeout(() => {
          if (this.pendingResponses.has(messageId)) {
            reject(new Error('Message response timeout'));
            this.pendingResponses.delete(messageId);
          }
        }, this.timeout);
      } catch (error) {
        console.error('Error sending message:', error);
        reject(error);
      }
    });
  }

  sendPortMessage(portId, type, data) {
    return new Promise((resolve, reject) => {
      try {
        const port = this.ports.get(portId);
        if (!port) {
          throw new Error(`Port not found: ${portId}`);
        }

        const messageId = Date.now().toString();
        
        // Store the promise handlers
        this.pendingResponses.set(messageId, { resolve, reject });
        
        // Send the message
        port.postMessage({
          type,
          messageId,
          ...data
        });
        
        // Set timeout
        setTimeout(() => {
          if (this.pendingResponses.has(messageId)) {
            reject(new Error('Port message response timeout'));
            this.pendingResponses.delete(messageId);
          }
        }, this.timeout);
      } catch (error) {
        console.error('Error sending port message:', error);
        reject(error);
      }
    });
  }

  cleanup() {
    try {
      // Close all ports
      for (const [portId, port] of this.ports) {
        try {
          port.close();
          this.ports.delete(portId);
        } catch (error) {
          console.warn(`Error closing port ${portId}:`, error);
        }
      }

      // Reject any pending responses
      for (const [messageId, { reject }] of this.pendingResponses) {
        try {
          reject(new Error('Message handler cleanup'));
          this.pendingResponses.delete(messageId);
        } catch (error) {
          console.warn(`Error rejecting pending response ${messageId}:`, error);
        }
      }

      // Clear all handlers
      this.handlers.clear();
      this.pendingResponses.clear();
      
      console.log('MessageHandler cleanup completed');
    } catch (error) {
      console.error('Error during MessageHandler cleanup:', error);
    }
  }

  isValidOrigin(origin) {
    // Add your allowed origins here
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5000'
    ];

    return allowedOrigins.includes(origin) || 
           origin.startsWith('http://localhost:') || 
           origin.startsWith('https://localhost:');
  }
}

// Create singleton instance
const messageHandler = new MessageHandler();
messageHandler.init();

export default messageHandler; 