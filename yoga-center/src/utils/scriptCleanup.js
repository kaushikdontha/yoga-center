// List of known problematic scripts
const PROBLEMATIC_SCRIPTS = [
  'load_embeds.js',
  'embed_script.js',
  'twitter-widgets.js',
  'platform.twitter.com',
  'iframe_api.js'
];

// List of known benign errors
const BENIGN_ERRORS = [
  'message port closed',
  'twitter',
  'Object tweets',
  'Failed to load tweets',
  'floater-button',
  'dataType'
];

// Script cleanup utility
class ScriptCleanup {
  constructor() {
    this.scripts = new Map();
    this.observers = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    // Handle page unload
    window.addEventListener('beforeunload', this.cleanup.bind(this));
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.suspendScripts();
      } else {
        this.resumeScripts();
      }
    });

    this.initialized = true;
    console.log('ScriptCleanup initialized');
  }

  registerScript(id, script) {
    try {
      this.scripts.set(id, script);
      
      // Create observer for script element
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const removedNodes = Array.from(mutation.removedNodes);
            if (removedNodes.includes(script)) {
              this.handleScriptRemoval(id);
            }
          }
        });
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.observers.set(id, observer);
      console.log('Registered script:', id);
    } catch (error) {
      console.error('Error registering script:', error);
    }
  }

  handleScriptRemoval(id) {
    try {
      const script = this.scripts.get(id);
      if (script) {
        // Cleanup script resources
        if (script.onload) script.onload = null;
        if (script.onerror) script.onerror = null;
        
        // Remove from document if still present
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }

        // Cleanup observer
        const observer = this.observers.get(id);
        if (observer) {
          observer.disconnect();
          this.observers.delete(id);
        }

        // Remove from tracking
        this.scripts.delete(id);
        console.log('Cleaned up script:', id);
      }
    } catch (error) {
      console.error('Error handling script removal:', error);
    }
  }

  suspendScripts() {
    try {
      for (const [id, script] of this.scripts) {
        // Temporarily disable script execution
        script.setAttribute('type', 'javascript/blocked');
        console.log('Suspended script:', id);
      }
    } catch (error) {
      console.error('Error suspending scripts:', error);
    }
  }

  resumeScripts() {
    try {
      for (const [id, script] of this.scripts) {
        // Re-enable script execution
        script.setAttribute('type', 'text/javascript');
        console.log('Resumed script:', id);
      }
    } catch (error) {
      console.error('Error resuming scripts:', error);
    }
  }

  cleanup() {
    try {
      // Cleanup all scripts
      for (const [id, script] of this.scripts) {
        this.handleScriptRemoval(id);
      }

      // Clear all observers
      for (const observer of this.observers.values()) {
        observer.disconnect();
      }
      this.observers.clear();

      // Clear tracking
      this.scripts.clear();
      console.log('ScriptCleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Create singleton instance
const scriptCleanup = new ScriptCleanup();
scriptCleanup.init();

// Clean up any existing script instances
export function cleanupScripts() {
  // Remove any existing script tags
  PROBLEMATIC_SCRIPTS.forEach(scriptName => {
    const scripts = document.querySelectorAll(`script[src*="${scriptName}"]`);
    scripts.forEach(script => script.remove());
  });

  // Clean up global variables
  window.twttr = undefined;
  window.__FLOATER_BUTTON = undefined;
  window.__EMBED_SCRIPT = undefined;
}

// Handle script errors
export function handleScriptError(error) {
  const errorText = (
    error.message || 
    error.reason?.message || 
    error.reason || 
    error.toString()
  ).toLowerCase();

  return BENIGN_ERRORS.some(err => errorText.includes(err.toLowerCase()));
}

// Initialize error handlers
export function initializeErrorHandlers() {
  // Handle synchronous errors
  window.addEventListener('error', (event) => {
    if (handleScriptError(event)) {
      event.preventDefault();
      return false;
    }
  }, true);

  // Handle promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (handleScriptError(event)) {
      event.preventDefault();
      return false;
    }
  });

  // Handle message events
  window.addEventListener('message', (event) => {
    try {
      // Ignore messages without data
      if (!event.data) return;

      // Handle specific message types
      const { type, dataType } = event.data;
      
      if (type === 'embed' || dataType === 'floater-button') {
        event.preventDefault();
        return false;
      }
    } catch (error) {
      // Ignore message handling errors
      return false;
    }
  });
}

// Export a function to initialize everything
export function initializeScriptCleanup() {
  cleanupScripts();
  initializeErrorHandlers();
}

export default scriptCleanup; 