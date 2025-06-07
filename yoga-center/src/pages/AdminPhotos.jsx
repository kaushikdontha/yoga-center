import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPhotos(currentPage);
  }, [currentPage]);

  const fetchPhotos = async (page = 1) => {
    try {
      console.log('[Photos] Fetching photos for page:', page);
      const response = await axios.get(`/api/photos?page=${page}&limit=8`);
      
      if (response.data.photos) {
        const processedPhotos = response.data.photos.map(photo => ({
          ...photo,
          url: photo.url.startsWith('http') ? photo.url : photo.url // Use relative URL only
        }));
        setPhotos(processedPhotos);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setPhotos([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('[Photos] Error fetching photos:', err);
      setError("Failed to fetch photos");
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="p-4">Loading photos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo._id} className="border rounded-lg p-4">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="mt-2">
              <h3 className="font-semibold">{photo.title}</h3>
              <p className="text-gray-600">{photo.description}</p>
              {photo.event && (
                <p className="text-sm text-gray-500 mt-1">
                  Event: {photo.event}
                </p>
              )}
              {photo.isCoverImage && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                  Cover Image
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPhotos;