import { useState, useEffect } from 'react';
import axios from 'axios';

const Videos = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get('/api/video');
        setVideo(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
        setLoading(false);
      }
    };

    fetchVideo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!video || !video.url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">No video available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Featured Video</h1>
      <div className="max-w-4xl mx-auto">
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-full object-cover"
            src={video.url}
            title={video.title || 'Featured Video'}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        {video.title && (
          <h2 className="text-xl font-semibold mt-4">{video.title}</h2>
        )}
        {video.description && (
          <p className="text-gray-600 mt-2">{video.description}</p>
        )}
      </div>
    </div>
  );
};

export default Videos; 