import { useEffect, useState } from 'react';
import api from '../utils/axios';

const Gallery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/gallery')
      .then(res => setEvents(res.data))
      .catch(() => setError('Failed to load gallery.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading gallery...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-12 px-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>
      {events.length === 0 ? (
        <div className="text-center text-gray-500">No events yet.</div>
      ) : (
        <div className="space-y-12">
          {events.map(event => (
            <div key={event._id}>
              <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
              <div className="text-gray-600 mb-4">{event.date?.slice(0,10)}</div>
              <div className="mb-4 text-gray-700">{event.description}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.photos && event.photos.length > 0 ? (
                  event.photos.map(photo => (
                    <div key={photo._id} className="border rounded overflow-hidden">
                      <img src={photo.url} alt={photo.title} className="w-full h-32 object-cover" />
                      <div className="p-1 text-xs text-center">{photo.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-gray-400 text-center">No photos for this event.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
