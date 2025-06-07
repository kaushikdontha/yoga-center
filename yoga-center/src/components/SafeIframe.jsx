import { useEffect, useRef, useState } from 'react';
import messageHandler from '../services/messageHandler';

const SafeIframe = ({ 
  src, 
  title, 
  className, 
  sandbox = '', 
  allowScripts = true,
  onLoad,
  onError,
  timeout = 30000 // 30 seconds timeout
}) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let isMounted = true;
    const messageIds = new Set();

    const setupIframe = async () => {
      try {
        // Create a message channel for communication
        const channel = new MessageChannel();
        
        // Set up port message handling
        channel.port1.onmessage = async (event) => {
          try {
            const { data, messageId } = event.data;
            
            if (!messageIds.has(messageId)) {
              console.warn('Received message for unknown messageId:', messageId);
              return;
            }

            switch (data.type) {
              case 'resize':
                if (data.height && isMounted) {
                  iframe.style.height = `${data.height}px`;
                }
                break;
              case 'ready':
                if (isMounted) {
                  setIsLoading(false);
                  if (onLoad) onLoad();
                }
                break;
              case 'error':
                console.error('Error from iframe:', data.error);
                if (isMounted) {
                  setError(data.error);
                  if (onError) onError(data.error);
                }
                break;
              default:
                // Forward other messages to parent
                if (window.parent !== window) {
                  window.parent.postMessage(data, '*');
                }
            }
          } catch (error) {
            console.error('Error handling iframe message:', error);
            if (isMounted) {
              setError(error.message);
              if (onError) onError(error);
            }
          }
        };

        // Handle port errors
        channel.port1.onmessageerror = (error) => {
          console.error('Port message error:', error);
          if (isMounted) {
            setError('Communication error with iframe');
            if (onError) onError(error);
          }
        };

        // Start the port
        channel.port1.start();

        // Register message handler for this iframe
        const messageId = Date.now().toString();
        messageIds.add(messageId);

        messageHandler.registerHandler(`iframe-${messageId}`, async (data) => {
          try {
            // Forward message to iframe through the channel
            channel.port1.postMessage({
              data,
              messageId
            });
            return true; // Indicate async response
          } catch (error) {
            console.error('Error forwarding message to iframe:', error);
            throw error;
          }
        });

        // Set up load handler
        const handleLoad = async () => {
          try {
            // Send init message with the message port
            iframe.contentWindow.postMessage(
              { type: 'init', messageId },
              '*',
              [channel.port2]
            );

            // Clear timeout if set
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          } catch (error) {
            console.error('Error during iframe initialization:', error);
            if (isMounted) {
              setError('Failed to initialize iframe');
              if (onError) onError(error);
            }
          }
        };

        iframe.addEventListener('load', handleLoad);

        // Set timeout for iframe load
        timeoutRef.current = setTimeout(() => {
          if (isMounted && isLoading) {
            const error = new Error('Iframe load timeout');
            setError(error.message);
            if (onError) onError(error);
          }
        }, timeout);

        return () => {
          // Cleanup
          iframe.removeEventListener('load', handleLoad);
          channel.port1.close();
          channel.port2.close();
          messageHandler.unregisterHandler(`iframe-${messageId}`);
          messageIds.delete(messageId);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error setting up iframe:', error);
        if (isMounted) {
          setError('Failed to set up iframe');
          if (onError) onError(error);
        }
      }
    };

    setupIframe();

    return () => {
      isMounted = false;
    };
  }, [src, onLoad, onError, timeout]);

  // Construct sandbox value
  const sandboxValues = ['allow-same-origin'];
  if (allowScripts) sandboxValues.push('allow-scripts');
  if (sandbox) sandboxValues.push(...sandbox.split(' '));
  const sandboxAttr = sandboxValues.join(' ');

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className={`${className} ${isLoading ? 'invisible' : 'visible'}`}
        sandbox={sandboxAttr}
        loading="lazy"
        width="100%"
        style={{ 
          border: 'none', 
          width: '100%', 
          overflow: 'hidden',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default SafeIframe; 