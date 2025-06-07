import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const EventGallery = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventPhotos = async (eventId) => {
    try {
      const response = await axios.get(`/api/events/${eventId}/photos`);
      const updatedEvents = events.map(event => {
        if (event._id === eventId) {
          return { ...event, photos: response.data.photos };
        }
        return event;
      });
      setEvents(updatedEvents);
    } catch (err) {
      console.error('Error fetching event photos:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Event Gallery</h1>

      {/* Event Selection */}
      <div className="mb-8">
        <select
          value={selectedEvent || ''}
          onChange={(e) => {
            const eventId = e.target.value;
            setSelectedEvent(eventId);
            if (eventId) {
              fetchEventPhotos(eventId);
            }
          }}
          className="w-full md:w-1/2 mx-auto block border rounded-lg p-2 text-lg"
        >
          <option value="">Select an Event</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title} - {formatDate(event.date)}
            </option>
          ))}
        </select>
      </div>

      {/* Event Details and Photos */}
      {selectedEvent && events.map(event => {
        if (event._id === selectedEvent) {
          return (
            <div key={event._id} className="space-y-8">
              {/* Event Details */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4">{formatDate(event.date)}</p>
                <p className="max-w-2xl mx-auto">{event.description}</p>
              </div>

              {/* Event Cover Image */}
              {event.coverImage && (
                <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={event.coverImage.url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Event Photos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {event.photos?.map((photo) => (
                  <div
                    key={photo._id}
                    className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title || event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {photo.title && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-end">
                        <div className="p-4 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <h3 className="text-lg font-semibold">{photo.title}</h3>
                          {photo.description && (
                            <p className="text-sm">{photo.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* No Events Message */}
      {events.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No events available
        </div>
      )}
    </div>
  );
};

export default EventGallery;