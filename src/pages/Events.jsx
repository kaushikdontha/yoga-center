import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import ImagePreloader from '../components/ImagePreloader';

const CATEGORIES = ['workshop', 'class', 'retreat', 'general'];
const API_BASE_URL = 'http://localhost:5000';

// Memoized EventImage component
const EventImage = memo(({ event }) => {
  return (
    <ImagePreloader
      src={event.image}
      alt={event.title}
      containerClassName="w-full h-48"
      className="w-full h-full object-cover"
    />
  );
});

// Memoized Event Card component
const EventCard = memo(({ event, onRegister }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <EventImage event={event} />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {format(new Date(event.date), 'MMMM d, yyyy')}
          </span>
          <button
            onClick={() => onRegister(event._id)}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
});

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
          `${API_BASE_URL}/api/events${selectedCategory !== 'all' ? `/category/${selectedCategory}` : ''}`,
          {
            signal: controller.signal,
            timeout: 10000
          }
        );

        if (!isMounted) return;

        // Process events to ensure image URLs are correct
        const processedEvents = response.data.map(event => ({
          ...event,
          image: event.image?.startsWith('http') ? event.image : `${API_BASE_URL}${event.image}`
        }));

        setEvents(processedEvents);

        // Calculate stats for each category
        const stats = {};
        processedEvents.forEach(event => {
          stats[event.category] = (stats[event.category] || 0) + 1;
        });
        setCategoryStats(stats);
      } catch (err) {
        if (!isMounted) return;
        if (err.name === 'AbortError') return;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Navigation */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? "bg-primary-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All Events
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              {categoryStats[category] > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 rounded-full">
                  {categoryStats[category]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onRegister={handleRegister}
          />
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No events available{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Events; 