import { useEffect, useState, useRef } from "react";

const AUTO_PLAY_INTERVAL = 3500; // 3.5 seconds

const Carousel = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Fetch gallery images from the backend
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "http://localhost:5000/api/photos?category=gallery"
        );
        const data = await res.json();
        setImages(data.photos || data);
      } catch (err) {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (!images.length) return;
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [images, isPaused]);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (loading)
    return (
      <div className="w-full h-64 flex items-center justify-center">
        Loading...
      </div>
    );
  if (!images.length)
    return (
      <div className="w-full h-64 flex items-center justify-center">
        No images found.
      </div>
    );

  return (
    <div
      className="relative w-full max-w-3xl mx-auto h-64 rounded-xl overflow-hidden shadow-lg bg-gray-100 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <img
        src={
          images[current].url ||
          images[current].path ||
          images[current].image ||
          "/logo.png"
        }
        alt={images[current].title || `Yoga Gallery ${current + 1}`}
        className="w-full h-64 object-cover transition-all duration-700"
      />
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-2xl rounded-full p-2 shadow"
        aria-label="Previous"
      >
        &#8592;
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-2xl rounded-full p-2 shadow"
        aria-label="Next"
      >
        &#8594;
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`inline-block w-3 h-3 rounded-full ${
              idx === current ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
      <div className="absolute top-2 right-4 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">
        {isPaused ? "Paused" : "Auto-play"}
      </div>
    </div>
  );
};

export default Carousel;
