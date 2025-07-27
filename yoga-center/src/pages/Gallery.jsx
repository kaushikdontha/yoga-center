import { useEffect, useState } from "react";
import api from "../utils/axios";

const Gallery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    api
      .get("/api/gallery")
      .then((res) => {
        setEvents(res.data);
        // Create a flat array of all photos with event information
        const photos = res.data.flatMap(event =>
          (event.photos || []).map(photo => ({
            ...photo,
            eventTitle: event.title,
            eventDate: event.date
          }))
        );
        setAllPhotos(photos);
      })
      .catch(() => setError("Failed to load gallery."))
      .finally(() => setLoading(false));
  }, []);

  const openImageModal = (photo, event) => {
    const photoWithEvent = { ...photo, eventTitle: event.title };
    setSelectedImage(photoWithEvent);
    
    // Find the index of the clicked photo in the allPhotos array
    const index = allPhotos.findIndex(p => p._id === photo._id);
    setCurrentPhotoIndex(index >= 0 ? index : 0);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentPhotoIndex(0);
  };

  const goToPrevious = () => {
    if (currentPhotoIndex > 0) {
      const newIndex = currentPhotoIndex - 1;
      setCurrentPhotoIndex(newIndex);
      setSelectedImage(allPhotos[newIndex]);
    }
  };

  const goToNext = () => {
    if (currentPhotoIndex < allPhotos.length - 1) {
      const newIndex = currentPhotoIndex + 1;
      setCurrentPhotoIndex(newIndex);
      setSelectedImage(allPhotos[newIndex]);
    }
  };

  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    
    if (e.key === 'Escape') {
      closeImageModal();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, currentPhotoIndex]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        Loading gallery...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>
      {events.length === 0 ? (
        <div className="text-center text-gray-500">No events yet.</div>
      ) : (
        <div className="space-y-12">
          {events.map((event) => (
            <div key={event._id}>
              <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
              <div className="text-gray-600 mb-4">
                {event.date?.slice(0, 10)}
              </div>
              <div className="mb-4 text-gray-700">{event.description}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.photos && event.photos.length > 0 ? (
                  event.photos.map((photo) => (
                    <div
                      key={photo._id}
                      className="border rounded overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gray-100"
                      onClick={() => openImageModal(photo, event)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-32 object-contain"
                      />
                      <div className="p-1 text-xs text-center bg-white">
                        {photo.title}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-gray-400 text-center">
                    No photos for this event.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-4xl max-h-full w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container */}
            <div className="relative flex-grow min-h-0 flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
              />

              {/* Left Navigation Button */}
              {currentPhotoIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                >
                  ‹
                </button>
              )}
              
              {/* Right Navigation Button */}
              {currentPhotoIndex < allPhotos.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                >
                  ›
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white text-3xl font-bold hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            
            {/* Image Info */}
            <div className="flex-shrink-0 p-4 text-white text-center">
              <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
              <p className="text-sm opacity-90">{selectedImage.eventTitle}</p>
              {selectedImage.description && (
                <p className="text-sm opacity-75 mt-1">{selectedImage.description}</p>
              )}
              <p className="text-xs opacity-60 mt-2">
                {currentPhotoIndex + 1} of {allPhotos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
