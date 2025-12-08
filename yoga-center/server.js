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

// --- MongoDB Connection Setup (Cached for Serverless) ---
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // Increased to 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4, // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Monitor connection state changes
mongoose.connection.on('connected', () => console.log('Mongoose connected event'));
mongoose.connection.on('open', () => console.log('Mongoose open event'));
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected event');
  // Attempt to reconnect if disconnected
  connectDB().catch(err => console.error("Reconnection failed:", err));
});
mongoose.connection.on('reconnected', () => console.log('Mongoose reconnected event'));
mongoose.connection.on('disconnecting', () => console.log('Mongoose disconnecting event'));
mongoose.connection.on('close', () => console.log('Mongoose close event'));

// --- App Setup ---
const app = express();

// Ensure connection is established before handling requests
app.use(async (req, res, next) => {
  // Skip DB connection for static files to improve performance
  if (req.path.startsWith('/assets') || req.path.startsWith('/uploads') || req.path.match(/\.(css|js|png|jpg|jpeg|svg|ico)$/)) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed", details: error.message });
  }
});

// Define directories for uploads and placeholder image
// Define directories for uploads and placeholder image
// const uploadsDir = path.join(__dirname, "uploads");
// const placeholderPath = path.join(uploadsDir, "placeholder.jpg");

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug endpoint - Defined early to avoid routing issues
app.get("/api/debug-db", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

    let pingResult = "Not attempted";
    if (state === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        pingResult = "Success";
      } catch (e) {
        pingResult = `Failed: ${e.message}`;
      }
    }

    res.json({
      readyState: state,
      stateName: states[state],
      host: mongoose.connection.host,
      ping: pingResult,
      env_uri_exists: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Serve static files from the frontend build first
app.use(express.static(path.join(__dirname, "dist")));

// Serve uploaded images statically
// Serve uploaded images statically - REMOVED for Cloudinary migration
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Only listen if run directly (not imported as a module)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default app;
