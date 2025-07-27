import { useState, useEffect, useRef } from 'react';
import { useImageLoader } from '../hooks/useImageLoader';

const ImagePreloader = ({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = '',
  containerClassName = '',
  onLoad,
  onError,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { imageUrl, isLoading, error, retry } = useImageLoader(src);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset states when src changes
    setIsVisible(false);
    setHasLoaded(false);
  }, [src]);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      setHasLoaded(true);
      // Small delay to ensure smooth transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
          if (onLoad) onLoad();
        });
      });
    };

    img.onerror = () => {
      setHasLoaded(false);
      setIsVisible(false);
      if (onError) onError();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, onLoad, onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasLoaded]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ minHeight: '100px' }}
    >
      {/* Loading Placeholder */}
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${placeholderClassName}`}
        >
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 bg-red-100 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load image</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Image */}
      {imageUrl && !error && (
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isVisible && hasLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default ImagePreloader; 