import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useImageLoader } from '../hooks/useImageLoader';

const CATEGORIES = ['workshop', 'class', 'retreat', 'general'];
const API_BASE_URL = '';

const EventImage = ({ event }) => {
  const { imageUrl, isLoading } = useImageLoader(event.image);
  
  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={event.title}
      className="w-full h-48 object-cover"
      loading="lazy"
    />
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `/api/events${selectedCategory !== 'all' ? `/category/${selectedCategory}` : ''}`,
          {
            signal: controller.signal,
            timeout: 5000
          }
        );

        if (!isMounted) return;

        setEvents(response.data);

        // Calculate stats for each category
        const stats = {};
        response.data.forEach(event => {
          stats[event.category] = (stats[event.category] || 0) + 1;
        });
        setCategoryStats(stats);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching events:', err);
        setError('Failed to fetch events. Please try again later.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCategory]);

  const handleRegister = async (eventId) => {
    try {
      const userId = 'test-user-id'; // In a real app, get from auth system
      await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, { userId });
      // Refresh the events list
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      setEvents(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register for event');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg mx-4">
      <p className="font-semibold">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Events ({events.length})
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              {' '}({categoryStats[category] || 0})
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {selectedCategory === 'all' 
              ? 'No events scheduled at the moment' 
              : `No ${selectedCategory} events scheduled at the moment`}
          </h3>
          <p className="text-gray-500">
            Please check back later or try a different category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <EventImage event={event} />
                <div className="absolute top-2 right-2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium shadow-md">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Date:</span>{' '}
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </p>
                  {event.time && (
                    <p className="text-sm">
                      <span className="font-medium">Time:</span> {event.time}
                    </p>
                  )}
                  {event.duration && (
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {event.duration}
                    </p>
                  )}
                  {event.instructor && (
                    <p className="text-sm">
                      <span className="font-medium">Instructor:</span> {event.instructor}
                    </p>
                  )}
                  {event.price && (
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> ${event.price}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Availability:</span>{' '}
                    {event.capacity - (event.registeredUsers?.length || 0)} of {event.capacity} spots left
                  </p>
                </div>
                <button
                  onClick={() => handleRegister(event._id)}
                  disabled={event.registeredUsers?.length >= event.capacity}
                  className={`w-full py-2 px-4 rounded transition-colors ${
                    event.registeredUsers?.length >= event.capacity
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {event.registeredUsers?.length >= event.capacity
                    ? 'Event Full'
                    : 'Register Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;