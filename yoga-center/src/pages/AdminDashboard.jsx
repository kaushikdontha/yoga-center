import { useState, useEffect } from "react";
import axios from "axios";

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

  const fetchPhotos = async (page = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/photos?page=${page}&limit=8`
      );
      // Handle both array and object response
      setPhotos(Array.isArray(res.data) ? res.data : res.data.photos || []);
      setTotalPages(res.data.pagination ? res.data.pagination.pages : 1);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to fetch photos.");
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

  useEffect(() => {
    fetchPhotos();
    fetchVideo();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("title", file.name);
    formData.append("category", "gallery");

    try {
      await axios.post("http://localhost:5000/api/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchPhotos(currentPage);
      setFile(null);
    } catch (err) {
      setError("Upload failed. Please try again.");
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
      const res = await axios.post(
        "http://localhost:5000/api/video",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setVideoUrl(res.data.url);
      setVideoFile(null);
    } catch (err) {
      setVideoError(
        "Video upload failed. Only video files up to 100MB are allowed."
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

  const handleDelete = async (id) => {
    console.log("Attempting to delete photo with id:", id); // Add this line
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/photos/${id}`);
      fetchPhotos(currentPage);
    } catch (err) {
      setError("Delete failed. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

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
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={uploading || !file}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
      </form>

      {/* Error Display */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

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

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo._id} className="bg-white rounded shadow p-2">
            <img
              src={`http://localhost:5000${photo.url}`}
              alt={photo.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <div className="text-sm text-gray-700 font-medium mb-1">
              {photo.title}
            </div>
            <div className="text-xs text-gray-500 mb-2">{photo.category}</div>
            <div className="flex justify-between">
              <button
                onClick={() => handleEdit(photo)}
                className="text-blue-600 text-sm hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(photo._id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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
