import { useState, useEffect } from "react";
import axios from "axios";

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/photos")
      .then((res) => setPhotos(res.data))
      .catch(() => setError("Failed to fetch gallery photos."));
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="aspect-square">
              <img
                src={`http://localhost:5000${photo.url}`}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && !error && (
        <p className="text-center text-gray-600">
          No photos available in the gallery yet.
        </p>
      )}
    </div>
  );
};

export default Gallery;
