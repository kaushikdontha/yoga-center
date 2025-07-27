import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'http://localhost:5000';

// Global image cache
const imageCache = new Map();

// Preload image and cache it
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (imageCache.has(url)) {
      resolve(url);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      imageCache.set(url, true);
      resolve(url);
    };
    
    img.onerror = () => {
      imageCache.delete(url);
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
};

export const useImageLoader = (imagePath, fallbackImage = '/uploads/placeholder.jpg') => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
  const currentImagePath = useRef(imagePath);

  useEffect(() => {
    // Reset state if image path changes
    if (currentImagePath.current !== imagePath) {
      setIsLoading(true);
      setError(null);
      currentImagePath.current = imagePath;
    }

    let abortController = new AbortController();

    const loadImage = async () => {
      try {
        // Construct the full URL
        const fullUrl = imagePath?.startsWith('http') 
          ? imagePath 
          : `${API_BASE_URL}${imagePath || fallbackImage}`;

        // Check if image is already cached
        if (imageCache.has(fullUrl)) {
          if (isMounted.current) {
            setImageUrl(fullUrl);
            setIsLoading(false);
          }
          return;
        }

        // Start loading the image
        await preloadImage(fullUrl);

        // Only update state if component is still mounted and image path hasn't changed
        if (isMounted.current && currentImagePath.current === imagePath) {
          setImageUrl(fullUrl);
          setError(null);
        }
      } catch (err) {
        // Only update error state if component is still mounted and image path hasn't changed
        if (isMounted.current && currentImagePath.current === imagePath) {
          console.error('Error loading image:', err);
          setError(err);

          // Try loading the fallback image
          try {
            const fallbackUrl = `${API_BASE_URL}${fallbackImage}`;
            await preloadImage(fallbackUrl);
            if (isMounted.current && currentImagePath.current === imagePath) {
              setImageUrl(fallbackUrl);
            }
          } catch (fallbackErr) {
            console.error('Error loading fallback image:', fallbackErr);
          }
        }
      } finally {
        // Only update loading state if component is still mounted and image path hasn't changed
        if (isMounted.current && currentImagePath.current === imagePath) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted.current = false;
      abortController.abort();
    };
  }, [imagePath, fallbackImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return { 
    imageUrl, 
    error, 
    isLoading,
    // Add a retry function
    retry: () => {
      setIsLoading(true);
      setError(null);
      currentImagePath.current = imagePath; // Reset current path to force reload
    }
  };
};