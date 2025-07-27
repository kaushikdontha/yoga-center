import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ImageLoader = ({
  src,
  alt,
  className = '',
  placeholderSrc = '',
  fallbackSrc = '',
  loadingClassName = 'animate-pulse bg-gray-200',
  errorClassName = 'bg-red-100',
  transitionDuration = 300,
  retryDelay = 3000,
  maxRetries = 2,
  onLoad,
  onError,
}) => {
  const [status, setStatus] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || src);
  const [retryCount, setRetryCount] = useState(0);
  const imageRef = useRef(null);
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Load image in memory first
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    let currentRetryCount = retryCount;

    const handleLoad = () => {
      if (!mountedRef.current) return;
      
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        if (imageRef.current) {
          imageRef.current.style.opacity = '0';
          
          requestAnimationFrame(() => {
            setCurrentSrc(src);
            setStatus('loaded');
            
            requestAnimationFrame(() => {
              if (imageRef.current) {
                imageRef.current.style.opacity = '1';
              }
            });
          });
        }
      });

      onLoad?.();
    };

    const handleError = () => {
      if (!mountedRef.current) return;

      // Retry logic
      if (currentRetryCount < maxRetries) {
        setRetryCount(currentRetryCount + 1);
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            img.src = src + '?retry=' + (currentRetryCount + 1);
          }
        }, retryDelay);
      } else {
        setStatus('error');
        setCurrentSrc(fallbackSrc || src);
        onError?.();
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, retryCount, maxRetries, retryDelay, fallbackSrc, onLoad, onError]);

  // Compute dynamic classes
  const imageClasses = [
    className,
    status === 'loading' ? loadingClassName : '',
    status === 'error' ? errorClassName : '',
    'transition-opacity duration-300 ease-in-out',
  ].filter(Boolean).join(' ');

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        style={{
          transitionDuration: `${transitionDuration}ms`,
        }}
        onLoad={() => {
          if (currentSrc === src) {
            setStatus('loaded');
          }
        }}
        onError={() => {
          if (currentSrc === src) {
            setStatus('error');
          }
        }}
      />

      {/* Loading Overlay */}
      {status === 'loading' && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90">
          <div className="text-center">
            <svg 
              className="mx-auto h-8 w-8 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p className="mt-2 text-sm text-red-600">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

ImageLoader.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholderSrc: PropTypes.string,
  fallbackSrc: PropTypes.string,
  loadingClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  transitionDuration: PropTypes.number,
  retryDelay: PropTypes.number,
  maxRetries: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default ImageLoader; 