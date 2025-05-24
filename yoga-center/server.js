import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// --- App Setup ---
console.log("=== Yoga Center server.js started ===");
const app = express();

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- MongoDB Setup ---
mongoose
  .connect("mongodb://127.0.0.1:27017/yoga-center")
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// --- Mongoose Schema ---
const PhotoSchema = new mongoose.Schema({
  filename: String,
  url: String,
  title: String,
  description: String,
  category: {
    type: String,
    enum: ["gallery", "workshop", "class"],
    default: "gallery",
  },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Photo = mongoose.model("Photo", PhotoSchema);

// --- Contact Schema ---
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", ContactSchema);

// --- Video Schema (single video for homepage) ---
const VideoSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});
const Video = mongoose.model("Video", VideoSchema);

// --- Multer Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// --- Multer Setup for Video ---
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "video-" + Date.now() + path.extname(file.originalname)),
});
const videoUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// --- Routes ---
// CREATE - Upload a new photo
app.post("/api/photos", upload.single("photo"), async (req, res) => {
  console.log("[POST] /api/photos - Upload attempt");
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const url = `/uploads/${req.file.filename}`;
    const photo = new Photo({
      filename: req.file.filename,
      url,
      title: req.body.title || req.file.filename,
      description: req.body.description,
      category: req.body.category,
    });

    await photo.save();
    console.log("Photo saved to MongoDB:", photo);
    res.status(201).json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "Error uploading photo", details: error.message });
  }
});

// READ - Get all photos
app.get("/api/photos", async (req, res) => {
  console.log("[GET] /api/photos - Fetch all photos");
  try {
    const { category, sort = "uploadedAt", order = "desc" } = req.query;
    const query = category ? { category } : {};

    const photos = await Photo.find(query).sort({
      [sort]: order === "desc" ? -1 : 1,
    });
    console.log(`Fetched ${photos.length} photos`);
    res.json(photos);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Error fetching photos" });
  }
});

// READ - Get a single photo
app.get("/api/photos/:id", async (req, res) => {
  console.log(`[GET] /api/photos/${req.params.id} - Fetch single photo`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error("Invalid ObjectId");
      return res.status(404).json({ error: "Photo not found" });
    }
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      console.error("Photo not found in DB");
      return res.status(404).json({ error: "Photo not found" });
    }
    res.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Error fetching photo" });
  }
});

// UPDATE - Update photo details
app.put("/api/photos/:id", async (req, res) => {
  console.log(`[PUT] /api/photos/${req.params.id} - Update photo`);
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!photo) {
      console.error("Photo not found for update");
      return res.status(404).json({ error: "Photo not found" });
    }
    console.log("Photo updated:", photo);
    res.json(photo);
  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({ error: "Error updating photo" });
  }
});

// DELETE - Delete a photo
app.delete("/api/photos/:id", async (req, res) => {
  console.log(`[DELETE] /api/photos/${req.params.id} - Delete photo`);
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      console.error("Photo not found for delete");
      return res.status(404).json({ error: "Photo not found" });
    }

    // Delete the file from uploads folder
    const filePath = path.join(__dirname, "uploads", photo.filename);
    fs.unlink(filePath, async (err) => {
      if (err && err.code !== "ENOENT") {
        // Log error but continue to delete DB entry
        console.error("File deletion error:", err);
      }
      await photo.deleteOne();
      console.log("Photo deleted from MongoDB and file system");
      res.status(204).send();
    });
  } catch (error) {
    console.error("Delete API error:", error);
    res.status(500).json({ error: "Error deleting photo" });
  }
});

// CONTACT FORM SUBMISSION
app.post("/api/contact", async (req, res) => {
  console.log("[POST] /api/contact - Contact form submission");
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const contact = new Contact({ name, email, message });
    await contact.save();
    console.log("Contact form saved:", contact);
    res.status(201).json({ message: "Message received!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Error saving contact form." });
  }
});

// --- Admin: Get all contact form submissions ---
app.get("/api/contacts", async (req, res) => {
  console.log("[GET] /api/contacts - Fetch all contact form submissions");
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Error fetching contacts" });
  }
});

// --- Video Upload Endpoint (admin only) ---
app.post("/api/video", videoUpload.single("video"), async (req, res) => {
  console.log("[POST] /api/video - Video upload attempt");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }
    // Remove previous video if exists
    const prev = await Video.findOne();
    if (prev) {
      const prevPath = path.join(__dirname, "uploads", prev.filename);
      fs.unlink(prevPath, (err) => {
        if (err && err.code !== "ENOENT")
          console.error("Old video delete error:", err);
      });
      await Video.deleteMany();
    }
    const url = `/uploads/${req.file.filename}`;
    const video = new Video({ filename: req.file.filename, url });
    await video.save();
    console.log("Video uploaded and saved:", video);
    res.status(201).json(video);
  } catch (error) {
    console.error("Video upload error:", error);
    res
      .status(500)
      .json({ error: "Error uploading video", details: error.message });
  }
});

// --- Get Current Video ---
app.get("/api/video", async (req, res) => {
  try {
    const video = await Video.findOne().sort({ uploadedAt: -1 });
    if (!video) return res.json({ url: null });
    res.json({ url: video.url });
  } catch (error) {
    res.status(500).json({ error: "Error fetching video" });
  }
});

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Catch-all 404 handler (should be last)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URL: mongodb://127.0.0.1:27017/yoga-center`);
});
