import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminVideos = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    try {
      console.log('[Video] Fetching current video');
      const response = await axios.get('/api/video');
      if (response.data.url) {
        setVideo({
          ...response.data,
          url: response.data.url.startsWith('http://') ? response.data.url : `http://localhost:5000${response.data.url}`
        });
      } else {
        setVideo(null);
      }
      setLoading(false);
    } catch (err) {
      console.error('[Video] Error fetching video:', err);
      setError('Failed to fetch video');
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', file.name);
    formData.append('description', 'Uploaded video');

    setUploading(true);
    setError(null);

    try {
      console.log('[Video] Uploading new video');
      await axios.post('/api/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchVideo();
    } catch (err) {
      console.error('[Video] Error uploading video:', err);
      setError('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-4">Loading video...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video Management</h1>
      
      {/* Video Upload */}
      <div className="mb-6">
        <label className="block mb-2">
          <span className="text-gray-700">Upload New Video</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1 block w-full"
          />
        </label>
        {uploading && <p className="text-blue-500">Uploading video...</p>}
      </div>

      {/* Current Video */}
      {video ? (
        <div className="border rounded-lg p-4">
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <video
              src={video.url}
              controls
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div>
            <h3 className="font-semibold">{video.title}</h3>
            <p className="text-gray-600">{video.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No video uploaded yet. Please upload a video using the form above.
        </div>
      )}
    </div>
  );
};

export default AdminVideos;