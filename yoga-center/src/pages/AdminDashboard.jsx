import { useState, useEffect, useRef } from "react";
import axios from "axios";
import EventForm from "../components/EventForm";

const AdminDashboard = () => {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "gallery",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [event, setEvent] = useState("General");
  const [openEvents, setOpenEvents] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const eventRefs = useRef({});
  const [newEventName, setNewEventName] = useState("");
  const [renamingEvent, setRenamingEvent] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [eventActionError, setEventActionError] = useState("");
  const [allEvents, setAllEvents] = useState(["General"]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [message, setMessage] = useState(null);

  // Ref for file input to focus after event creation
  const fileInputRef = useRef(null);

  const fetchPhotos = async (page = 1) => {
    try {
      console.log('[Photos] Fetching photos for page:', page);
      const res = await axios.get(
        `/api/photos?page=${page}&limit=8`
      );
      
      console.log('[Photos] Response data:', res.data);
      
      if (res.data.photos) {
        console.log('[Photos] Processing photos:', res.data.photos.length);
        // Ensure all photos have the correct URL format and base URL
        const processedPhotos = res.data.photos.map(photo => {
          const fullUrl = photo.url.startsWith('http://') ? photo.url : `http://localhost:5000${photo.url}`;
          console.log('[Photos] Processed photo:', {
            id: photo._id,
            eventId: photo.eventId,
            url: fullUrl,
            isCoverImage: photo.isCoverImage,
            category: photo.category
          });
          return {
            ...photo,
            url: fullUrl
          };
        });
        
        console.log('[Photos] All processed photos:', processedPhotos);
        setPhotos(processedPhotos);
      } else {
        console.warn('[Photos] No photos array in response');
        setPhotos([]);
      }
      
      // Update pagination state
      if (res.data.pagination) {
        console.log('[Photos] Updating pagination:', res.data.pagination);
        setTotalPages(res.data.pagination.totalPages);
        setCurrentPage(res.data.pagination.currentPage);
      }
    } catch (err) {
      console.error('[Photos] Error fetching photos:', err);
      setError(err.response?.data?.error || "Failed to fetch photos.");
    }
  };

  // Fetch current video
  const fetchVideo = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/video");
      setVideoUrl(res.data.url || "");
    } catch (err) {
      setVideoUrl("");
    }
  };

  // Fetch all events from backend
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      // Ensure 'General' is always present and at the top
      let events = res.data || [];
      if (!events.includes("General")) events = ["General", ...events];
      else {
        // Move 'General' to the front if not already
        events = ["General", ...events.filter((e) => e !== "General")];
      }
      setAllEvents(events);
    } catch (err) {
      // fallback: keep current allEvents
    }
  };

  // --- Replace groupedPhotos and eventNames logic to use allEvents for grouping, so empty events are always present ---
  const groupedPhotos = allEvents.reduce((acc, evt) => {
    acc[evt] = photos.filter((photo) => (photo.event || "General") === evt);
    return acc;
  }, {});

  // Set all events open by default on first load
  useEffect(() => {
    if (allEvents.length && Object.keys(openEvents).length === 0) {
      const initial = {};
      allEvents.forEach((evt) => (initial[evt] = true));
      setOpenEvents(initial);
      setSelectedEvent(allEvents[0]);
    }
  }, [allEvents]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchPhotos(),
          fetchVideo(),
          fetchEvents()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []); // Run only once on mount

  // Handle photo changes
  useEffect(() => {
    if (photos.length > 0) {
      // Get unique events from photos
      const photoEvents = [...new Set(photos.map(photo => photo.event || "General"))];
      
      // Update allEvents while preserving order and existing events
      setAllEvents(prev => {
        const newEvents = [...new Set([...prev, ...photoEvents])];
        // Ensure General is always first
        if (newEvents.includes("General")) {
          return ["General", ...newEvents.filter(e => e !== "General")];
        }
        return newEvents;
      });
    }
  }, [photos]); // Only run when photos change

  // After photo upload, event create, event rename, or event delete, refresh events
  const refreshEventsAndPhotos = async () => {
    await fetchEvents();
    await fetchPhotos(currentPage);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    // Get the event value from state
    if (event === "__add_new__") {
      setError("Please select or create an event before uploading.");
      return;
    }

    console.log('[AdminDashboard] Starting image upload:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      event: event,
      timestamp: new Date().toISOString()
    });

    setUploading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("title", file.name);
    formData.append("category", "gallery");
    formData.append("event", event);

    try {
      console.log('[AdminDashboard] Sending upload request to server');
      const response = await axios.post("/api/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log('[AdminDashboard] Upload successful:', {
        response: response.data,
        timestamp: new Date().toISOString()
      });

      // Refresh the photos list
      await fetchPhotos(currentPage);
      setFile(null);
      setMessage("Photo uploaded successfully!");
    } catch (err) {
      console.error('[AdminDashboard] Upload error:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        timestamp: new Date().toISOString()
      });
      setError(err.response?.data?.error || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    setVideoUploading(true);
    setVideoError("");
    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await axios.post(
        "http://localhost:5000/api/video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            'Authorization': `Bearer ${token}`
          },
        }
      );
      setVideoUrl(res.data.url);
      setVideoFile(null);
    } catch (err) {
      console.error('Video upload error:', err);
      setVideoError(
        err.response?.status === 401 
          ? "Authentication required. Please log in again."
          : "Video upload failed. Only video files up to 100MB are allowed."
      );
    } finally {
      setVideoUploading(false);
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || "",
      category: photo.category,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/photos/${editingPhoto._id}`,
        formData
      );
      setEditingPhoto(null);
      fetchPhotos(currentPage);
    } catch (err) {
      setError("Update failed. Please try again.");
    }
  };

  const handleDelete = async (photo) => {
    console.log("Attempting to delete photo:", {
      id: photo._id,
      isCoverImage: photo.isCoverImage,
      eventId: photo.eventId,
      filename: photo.filename
    });

    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      // Construct the correct ID for deletion
      const deleteId = photo.isCoverImage ? `${photo.eventId}_cover` : photo._id;
      console.log("Deleting photo with ID:", deleteId);

      await axios.delete(`http://localhost:5000/api/photos/${deleteId}`);
      console.log("Photo deleted successfully");
      
      // Refresh both photos and events
      await Promise.all([
        fetchPhotos(currentPage),
        fetchEvents()
      ]);

      // Update local state to remove the deleted photo
      setPhotos(prevPhotos => prevPhotos.filter(p => p._id !== photo._id));
      
      // If this was a cover image, refresh the entire event list
      if (photo.isCoverImage) {
        await refreshEventsAndPhotos();
      }

    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      setError("Delete failed. Please try again.");
    }
  };

  const handleEventClick = (evt) => {
    setSelectedEvent(evt);
    setOpenEvents((prev) => ({ ...prev, [evt]: true }));
    setTimeout(() => {
      if (eventRefs.current[evt]) {
        eventRefs.current[evt].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const toggleEvent = (evt) => {
    setOpenEvents((prev) => ({ ...prev, [evt]: !prev[evt] }));
  };

  // --- Event Management ---
  const handleCreateEvent = async () => {
    setEventActionError("");
    const trimmed = newEventName.trim();
    if (!trimmed) {
      setEventActionError("Event name cannot be empty.");
      return;
    }
    if (allEvents.includes(trimmed)) {
      setEventActionError("Event already exists.");
      return;
    }

    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setEventActionError("Authentication required. Please log in.");
        // Redirect to login
        window.location.href = '/admin-login';
        return;
      }

      // Create a new event with minimal required data
      const eventData = {
        title: trimmed,
        description: `Event: ${trimmed}`,
        date: new Date(),
        category: 'general'
      };

      console.log('Creating new event:', eventData);

      const response = await axios.post('http://localhost:5000/api/events', eventData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Event created successfully:', response.data);

      // Update local state
      setOpenEvents((prev) => ({ ...prev, [trimmed]: true }));
      setSelectedEvent(trimmed);
      setEvent(trimmed);
      setNewEventName("");

      // Only fetch events to update the list, don't fetch photos
      await fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      
      let errorMessage = "Failed to create event";
      
      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
        // Redirect to login
        window.location.href = '/admin-login';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setEventActionError(errorMessage);
    }
  };

  const handleDeleteEvent = async (evt) => {
    if (!window.confirm(`Delete event '${evt}' and all its photos?`)) return;
    
    try {
      // First try to get the event ID from the photos array using case-insensitive matching
      const eventPhoto = photos.find(photo => 
        (photo.event || '').toLowerCase() === evt.toLowerCase() || 
        (photo.eventTitle || '').toLowerCase() === evt.toLowerCase() || 
        (photo.title || '').toLowerCase() === evt.toLowerCase()
      );

      let eventId;
      
      if (eventPhoto) {
        // If we found a photo, use its eventId
        eventId = eventPhoto.eventId;
      } else {
        // If no photo found, fetch the events list to find the event
        console.log('No photos found for event, fetching events list...');
        const response = await axios.get('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Use case-insensitive matching for event title
        const eventToDelete = response.data.find(event => 
          (typeof event === 'string' ? event : event.title).toLowerCase() === evt.toLowerCase()
        );

        if (!eventToDelete) {
          console.error('Event not found:', evt);
          setMessage({ type: 'error', text: `Could not find event: ${evt}` });
          return;
        }

        eventId = eventToDelete._id;
      }

      console.log('Found event to delete:', {
        title: evt,
        eventId: eventId
      });

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
        window.location.href = '/admin-login';
        return;
      }

      // Delete the event using its MongoDB ID
      const response = await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        console.log('Event deleted successfully:', response.data);
        
        // Remove from openEvents
        setOpenEvents((prev) => {
          const copy = { ...prev };
          delete copy[evt];
          return copy;
        });

        // Update selected event if it was the deleted one
        if (selectedEvent === evt) {
          const remainingEvents = allEvents.filter((e) => e !== evt);
          setSelectedEvent(remainingEvents[0] || null);
        }
        
        // Refresh the UI
        await refreshEventsAndPhotos();
        
        // Show success message
        setMessage({ type: 'success', text: `Event "${evt}" deleted successfully` });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      
      // Handle different error cases
      if (error.response?.status === 401) {
        setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
        window.location.href = '/admin-login';
      } else if (error.response?.status === 403) {
        setMessage({ type: 'error', text: 'You do not have permission to delete events.' });
      } else if (error.response?.status === 404) {
        setMessage({ type: 'error', text: 'Event not found. It may have been already deleted.' });
        await refreshEventsAndPhotos(); // Refresh list to ensure UI is in sync
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to delete event: ${error.response?.data?.error || error.message}` 
        });
      }
    }
  };

  const handleStartRename = (evt) => {
    setRenamingEvent(evt);
    setRenameValue(evt);
    setEventActionError("");
  };

  const handleRenameEvent = async (evt) => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setEventActionError("Event name cannot be empty.");
      return;
    }
    if (allEvents.includes(trimmed) && trimmed !== evt) {
      setEventActionError("Event with this name already exists.");
      return;
    }
    setEventActionError("");
    try {
      // Update all photos in this event
      const photosToUpdate = groupedPhotos[evt] || [];
      await Promise.all(
        photosToUpdate.map((photo) =>
          axios.put(`http://localhost:5000/api/photos/${photo._id}`, {
            ...photo,
            event: trimmed,
          })
        )
      );
      setRenamingEvent(null);
      setRenameValue("");
      await refreshEventsAndPhotos();
    } catch (err) {
      setEventActionError("Failed to rename event.");
    }
  };

  // Image error handling
  const handleImageError = (e, photo) => {
    // Only try placeholder once
    if (e.target.dataset.usedPlaceholder) return;
    
    console.error('[AdminDashboard] Image load error:', {
      photoId: photo._id,
      url: photo.url,
      event: photo.event || 'General',
      timestamp: new Date().toISOString()
    });
    
    e.target.dataset.usedPlaceholder = 'true';
    
    // Try to construct a corrected URL if needed
    let correctedUrl;
    if (photo.eventId && photo.category) {
      correctedUrl = photo.isCoverImage
        ? `/admin/events/${photo.category}/${photo.eventId}/cover/${photo.filename}`
        : `/admin/events/${photo.category}/${photo.eventId}/photos/${photo.filename}`;
        
      if (correctedUrl !== photo.url) {
        console.log('[AdminDashboard] Attempting with corrected URL:', {
          originalUrl: photo.url,
          correctedUrl,
          timestamp: new Date().toISOString()
        });
        e.target.src = correctedUrl;
        return;
      }
    }
    
    // If URL correction didn't work or wasn't possible, use placeholder
    console.log('[AdminDashboard] Using placeholder image:', {
      photoId: photo._id,
      timestamp: new Date().toISOString()
    });
    e.target.src = '/uploads/general/placeholder.jpg';
  };

  // Handle successful image loads
  const handleImageLoad = (photo) => {
    console.log('[AdminDashboard] Image loaded successfully:', {
      photoId: photo._id,
      url: photo.url,
      event: photo.event || 'General',
      timestamp: new Date().toISOString()
    });
  };

  const handleEventCreated = (newEvent) => {
    console.log('New event created:', newEvent);
    setShowEventForm(false);
    refreshEventsAndPhotos();
  };

  const handleEventError = (error) => {
    console.error('Error creating event:', error);
    setError(error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Event Management Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Events</h2>
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {showEventForm ? 'Cancel' : 'Create New Event'}
          </button>
        </div>

        {showEventForm && (
          <div className="mb-8">
            <EventForm
              onSuccess={handleEventCreated}
              onError={handleEventError}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Video Upload Section */}
        <form
          onSubmit={handleVideoUpload}
          className="mb-8 flex flex-col md:flex-row items-center gap-4"
        >
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="border rounded p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={videoUploading || !videoFile}
          >
            {videoUploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
        {videoError && <div className="text-red-600 mb-2">{videoError}</div>}
        {videoUrl && (
          <div className="mb-8 w-full max-w-xl">
            <div className="font-semibold mb-2">Current Home Page Video:</div>
            <video
              src={`http://localhost:5000${videoUrl}`}
              controls
              className="w-full rounded shadow"
            />
          </div>
        )}

        {/* Upload Form */}
        <form
          onSubmit={handleUpload}
          className="mb-8 flex flex-col md:flex-row items-center gap-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded p-2"
          />
          <div className="flex items-center gap-2">
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="border rounded p-2"
            >
              {allEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
              <option value="__add_new__">+ Add new event...</option>
            </select>
            {event === "__add_new__" && (
              <input
                type="text"
                placeholder="New event name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="border rounded p-2"
                onBlur={(e) => {
                  const trimmed = newEventName.trim();
                  if (trimmed) {
                    if (!allEvents.includes(trimmed)) {
                      setAllEvents((prev) => [...prev, trimmed]);
                    }
                    setEvent(trimmed);
                    setOpenEvents((prev) => ({ ...prev, [trimmed]: true }));
                    setNewEventName("");
                    // Blur the input and focus the file input for immediate upload
                    e.target.blur();
                    setTimeout(() => {
                      if (fileInputRef.current) fileInputRef.current.focus();
                    }, 0);
                  } else {
                    setEvent(allEvents[0] || "General");
                    setNewEventName("");
                  }
                }}
                autoFocus
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={uploading || !file}
          >
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
        </form>

        {/* Edit Form */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Edit Photo Details</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border rounded p-2"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  >
                    <option value="gallery">Gallery</option>
                    <option value="workshop">Workshop</option>
                    <option value="class">Class</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Management UI */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="New event name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="border rounded p-2"
              />
              <button
                onClick={handleCreateEvent}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                Add Event
              </button>
            </div>
            {eventActionError && (
              <div className="text-red-600 font-medium">{eventActionError}</div>
            )}
          </div>
          {/* List of events with edit/delete */}
          <div className="flex flex-wrap gap-2 mt-4">
            {allEvents.map((evt) => (
              <div
                key={evt}
                className="flex items-center gap-1 bg-white border rounded px-2 py-1"
              >
                {renamingEvent === evt ? (
                  <>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="border rounded p-1 mr-1"
                    />
                    <button
                      onClick={() => handleRenameEvent(evt)}
                      className="text-green-600 font-bold px-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRenamingEvent(null)}
                      className="text-gray-500 px-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-blue-700">{evt}</span>
                    <button
                      onClick={() => handleStartRename(evt)}
                      className="text-yellow-600 hover:underline px-1"
                      title="Rename event"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt)}
                      className="text-red-600 hover:underline px-1"
                      title="Delete event"
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Photo Grid Grouped by Event */}
        {allEvents.length > 0 && (
          <>
            {/* Event Navigation Bar */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-gray-200 sticky top-16 z-10 bg-white/90">
              {allEvents.map((evt) => (
                <button
                  key={evt}
                  onClick={() => handleEventClick(evt)}
                  className={`px-4 py-2 rounded-t-lg font-semibold whitespace-nowrap transition-colors duration-200 border-b-2 focus:outline-none ${
                    selectedEvent === evt
                      ? "bg-blue-100 text-blue-700 border-blue-600 shadow"
                      : "bg-gray-100 text-gray-600 border-transparent hover:bg-blue-50"
                  }`}
                >
                  {evt}
                </button>
              ))}
            </div>
            {/* Event Sections */}
            {allEvents.map((evt) => (
              <div
                key={evt}
                ref={(el) => (eventRefs.current[evt] = el)}
                className="mb-8 border rounded-lg shadow bg-white"
              >
                <button
                  className="w-full flex justify-between items-center px-6 py-4 text-xl font-bold text-blue-700 bg-blue-50 rounded-t-lg focus:outline-none hover:bg-blue-100 transition"
                  onClick={() => toggleEvent(evt)}
                  aria-expanded={openEvents[evt]}
                >
                  <span>{evt}</span>
                  <span
                    className={`ml-2 transition-transform ${
                      openEvents[evt] ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openEvents[evt]
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {(groupedPhotos[evt] || []).map((photo) => (
                      <div
                        key={photo._id}
                        className="bg-white rounded shadow p-2"
                      >
                        <div className="relative">
                          <img
                            src={`http://localhost:5000${photo.url}`}
                            alt={photo.title || photo.filename}
                            className="w-full h-32 object-cover rounded mb-2"
                            onError={(e) => handleImageError(e, photo)}
                            onLoad={(e) => handleImageLoad(photo)}
                            data-photo-id={photo._id}
                            data-event-id={photo.eventId}
                            data-category={photo.category}
                            data-is-cover={photo.isCoverImage}
                          />
                          {photo.isCoverImage && (
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                              Cover
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 font-medium mb-1">
                          {photo.title || photo.filename}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Event: {photo.event || 'General'}
                          <br />
                          Category: {photo.category}
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => handleEdit(photo)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(photo)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* If no photos, show a message */}
                    {(!groupedPhotos[evt] || groupedPhotos[evt].length === 0) && (
                      <div className="col-span-full text-center text-gray-400 py-8">
                        No photos in this event yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchPhotos(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          localStorage.removeItem("isAdmin");
          window.location.href = "/admin-login";
        }}
        className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
