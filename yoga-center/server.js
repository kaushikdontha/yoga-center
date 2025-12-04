import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs";

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories for uploads and placeholder image
const uploadsDir = path.join(__dirname, "uploads");
const placeholderPath = path.join(uploadsDir, "placeholder.jpg");

// --- App Setup ---
const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend build first
app.use(express.static(path.join(__dirname, "dist")));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import and mount API routes first
import apiRouter from "./routes/api.js";

// Only apply CORS to API routes
const corsOptions = {
  origin: "*", // Adjust as needed for production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use("/api", cors(corsOptions), apiRouter);

// For any other route, serve index.html (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Handle specific error types
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: "Invalid or expired token",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      message: err.message,
    });
  }

  if (err.code === "ENOENT") {
    return res.status(404).json({
      success: false,
      error: "File not found",
      message: "The requested file could not be found",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File too large",
      message: "File size should not exceed 5MB",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "Internal server error",
    message: err.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// Mongoose connection options for better stability
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, mongooseOptions);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Retry logic could go here, but for now let's just log and exit if it's a startup failure
    // In serverless, we might not want to exit, but for a long-running server we might.
    // For Vercel/Serverless, the container might be frozen, so we need to handle re-connections carefully.
  }
};

// Connect immediately
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});


