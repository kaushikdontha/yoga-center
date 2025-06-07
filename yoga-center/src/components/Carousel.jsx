import { useEffect, useState, useRef } from "react";
import axios from "axios";

const AUTO_PLAY_INTERVAL = 3500; // 3.5 seconds

const Carousel = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Cleanup function to prevent memory leaks
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchImages = async () => {
      console.log('[Carousel] Initiating fetchImages...');
      try {
        setLoading(true);
        setError(null);

        console.log('[Carousel] Making API request to:', `/api/photos`);
        const response = await axios.get(`/api/photos`, {
          signal: controller.signal,
          timeout: 5000 // 5 second timeout
        });

        if (!isMounted) return;

        // Process the images to ensure URLs are correct
        const processedImages = (response.data.photos || []).map(photo => {
          // Use only the relative URL as returned by the backend
          return {
            ...photo,
            url: photo.url
          };
        });

        console.log('Processed carousel images (final setImages value):', processedImages);
        setImages(processedImages);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching carousel images:', err);
        setError('Failed to load images. Please try again later.');
        setImages([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImages();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!images.length || isPaused || !mountedRef.current) return;

    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        setCurrent(prev => (prev + 1) % images.length);
      }
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images, isPaused]);

  const next = () => setCurrent(prev => (prev + 1) % images.length);
  const prev = () => setCurrent(prev => (prev - 1 + images.length) % images.length);

  const handleImageError = (imageId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  const getImageUrl = (image) => {
    if (imageLoadErrors[image._id]) {
      return '/uploads/placeholder.jpg';
    }
    return image.url;
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-xl">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">No images available.</p>
      </div>
    );
  }

  const currentImage = images[current];

  return (
    <div
      className="relative w-full max-w-3xl mx-auto h-64 rounded-xl overflow-hidden shadow-lg bg-gray-100 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <img
        src={getImageUrl(currentImage)}
        alt={currentImage.title || `Yoga Gallery ${current + 1}`}
        className="w-full h-64 object-cover transition-all duration-700"
        onError={() => handleImageError(currentImage._id)}
        loading="lazy"
      />
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-2xl rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous"
      >
        &#8592;
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-2xl rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next"
      >
        &#8594;
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-colors ${
              idx === current ? "bg-blue-600" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      <div className="absolute top-2 right-4 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">
        {isPaused ? "Paused" : "Auto-play"}
      </div>
    </div>
  );
};

export default Carousel;
