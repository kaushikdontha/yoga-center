import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

export const useImageLoader = (imagePath, fallbackImage = '/uploads/placeholder.jpg') => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let img = new Image();

    const loadImage = async () => {
      try {
        console.log('[ImageLoader] Starting to load image:', {
          imagePath,
          fallbackImage,
          timestamp: new Date().toISOString()
        });

        setIsLoading(true);
        setError(null);

        // Construct the full URL
        const fullUrl = imagePath?.startsWith('http') 
          ? imagePath 
          : `${API_BASE_URL}${imagePath || fallbackImage}`;

        console.log('[ImageLoader] Constructed full URL:', fullUrl);

        // Create a promise to handle image loading
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('[ImageLoader] Image loaded successfully:', {
              url: fullUrl,
              dimensions: `${img.width}x${img.height}`,
              timestamp: new Date().toISOString()
            });
            resolve();
          };
          img.onerror = (err) => {
            console.error('[ImageLoader] Image load error:', {
              url: fullUrl,
              error: err,
              timestamp: new Date().toISOString()
            });
            reject(err);
          };
          img.src = fullUrl;
        });

        if (isMounted) {
          setImageUrl(fullUrl);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[ImageLoader] Error in loadImage:', {
            error: err,
            imagePath,
            fallbackImage,
            timestamp: new Date().toISOString()
          });
          setError(err);
          // Try loading the fallback image
          const fallbackUrl = `${API_BASE_URL}${fallbackImage}`;
          console.log('[ImageLoader] Attempting to load fallback image:', fallbackUrl);
          setImageUrl(fallbackUrl);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('[ImageLoader] Loading state completed:', {
            success: !error,
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    loadImage();

    return () => {
      console.log('[ImageLoader] Cleaning up image loader:', {
        imagePath,
        timestamp: new Date().toISOString()
      });
      isMounted = false;
      // Cancel the image loading if component unmounts
      img.src = '';
    };
  }, [imagePath, fallbackImage]);

  return { imageUrl, error, isLoading };
};

export default useImageLoader; 