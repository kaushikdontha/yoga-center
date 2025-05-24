import { useState, useEffect } from "react";
import axios from "axios";

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/photos", {
          params: {
            category: "gallery",
          },
        });
        // Handle both array response and paginated response
        const photoData = response.data.photos || response.data;
        setPhotos(photoData);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Failed to fetch gallery photos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
        <div className="text-gray-600">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
      {error && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded">{error}</div>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={`http://localhost:5000${photo.url}`}
                alt={photo.title || photo.filename}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {photo.description && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                  <p className="text-white text-center">{photo.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          <p>No photos available in the gallery yet.</p>
          <p className="mt-2">Visit the admin dashboard to add some photos!</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
