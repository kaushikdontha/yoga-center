import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [photoFiles, setPhotoFiles] = useState({}); // { [eventId]: File }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!token || isAdmin !== 'true') {
      navigate('/admin/login', { replace: true });
      return;
    }

    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events');
      setEvents(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingEvent) {
        await api.put(`/api/events/${editingEvent._id}`, formData);
      } else {
        await api.post('/api/events', formData);
      }
      resetForm();
      await fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/api/events/${eventId}`);
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. ' + (err.response?.data?.message || ''));
    }
  };

  const handlePhotoUpload = async (eventId) => {
    const file = photoFiles[eventId];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    try {
      await api.post(`/api/events/${eventId}/photos`, form);
      setPhotoFiles((prev) => ({ ...prev, [eventId]: null }));
      await fetchEvents();
    } catch {
      setError('Failed to upload photo.');
    }
  };

  const handleDeletePhoto = async (eventId, photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await api.delete(`/api/events/${eventId}/photos/${photoId}`);
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo. ' + (err.response?.data?.message || ''));
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '' });
    setEditingEvent(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/admin/login', { replace: true });
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {editingEvent ? 'Update Event' : 'Create Event'}
          </button>
          {editingEvent && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="space-y-8">
          {events.map(event => (
            <div key={event._id} className="border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold">{event.title}</h2>
                  <div className="text-gray-600 text-sm">{event.date?.slice(0,10)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setFormData({
                        title: event.title,
                        description: event.description,
                        date: event.date?.slice(0,10)
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-yellow-400 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <strong>Description:</strong> {event.description}
              </div>
              {/* Photo upload */}
              <div className="mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFiles(prev => ({ ...prev, [event._id]: e.target.files[0] }))}
                />
                <button
                  onClick={() => handlePhotoUpload(event._id)}
                  className="ml-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  Upload Photo
                </button>
              </div>
              {/* Photos grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {event.photos?.map(photo => (
                  <div key={photo._id} className="border rounded overflow-hidden relative group">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-1 text-xs text-center">{photo.title}</div>
                    <button
                      onClick={() => handleDeletePhoto(event._id, photo._id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete photo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                {(!event.photos || event.photos.length === 0) && <div className="col-span-full text-gray-400 text-center">No photos yet.</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;