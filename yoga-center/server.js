import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define categories constant
const CATEGORIES = ['workshop', 'class', 'retreat', 'general', 'gallery'];

// Update base paths
const uploadsDir = path.join(__dirname, "uploads");
const eventsDir = path.join(uploadsDir, "events");
const galleryDir = path.join(uploadsDir, "gallery");

// Create necessary directories
[uploadsDir, eventsDir, galleryDir].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (error) {
    console.error(`Error with directory ${dir}:`, error);
  }
});

// Create category directories
CATEGORIES.forEach(category => {
  const categoryDir = path.join(eventsDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`Created category directory: ${categoryDir}`);
  }
});

// Create placeholder image if it doesn't exist
const placeholderPath = path.join(uploadsDir, 'placeholder.jpg');
if (!fs.existsSync(placeholderPath)) {
  const placeholderSvg = Buffer.from(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">Image not found</text>
    </svg>
  `);
  fs.writeFileSync(placeholderPath, placeholderSvg);
  console.log('Created placeholder image:', placeholderPath);
}

// --- App Setup ---
const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      // Add your production domain when ready
    ];

    if (process.env.NODE_ENV === 'development') {
      callback(null, true); // Allow all origins in development
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow specific origins in production
    } else {
      callback(new Error('CORS policy violation'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight request for 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const { eventId, category } = req.params;
      // Default to 'general' if no category specified
      const actualCategory = category || 'general';
      const uploadPath = path.join(eventsDir, actualCategory, eventId || 'temp', 'cover');
      
      // Create directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Created upload directory: ${uploadPath}`);
      
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Generate a safe filename
      const ext = path.extname(file.originalname);
      const filename = `cover${ext}`;  // Using consistent filename
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    } catch (error) {
      console.error('Error in multer filename:', error);
      cb(error);
    }
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// --- Global API Request/Response Logging Middleware ---
app.use((req, res, next) => {
  const reqId = Math.random().toString(36).substring(2, 10);
  req.reqId = reqId;
  const start = Date.now();
  console.log(`[API REQUEST][${reqId}] ${req.method} ${req.originalUrl}`, {
    time: new Date().toISOString(),
    ip: req.ip,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  // Log response when finished
  const send = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    let bodySummary = body;
    if (typeof body === 'string' && body.length > 300) {
      bodySummary = body.slice(0, 300) + '...';
    }
    if (typeof body === 'object') {
      try {
        bodySummary = JSON.stringify(body).slice(0, 300) + '...';
      } catch {}
    }
    console.log(`[API RESPONSE][${reqId}] ${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      body: bodySummary,
      durationMs: duration,
      time: new Date().toISOString()
    });
    return send.call(this, body);
  };
  next();
});

// Import and mount API routes first
import apiRouter from './routes/api.js';
app.use('/api', apiRouter);

// Serve static files with better error handling
app.use('/uploads', (req, res, next) => {
  // Clean and normalize the path to prevent directory traversal
  const normalizedPath = path.normalize(req.path).replace(/^([\.\/\\])+/, '');
  const requestedPath = path.join(uploadsDir, normalizedPath);

  // Log every static image request
  console.log('[STATIC IMAGE REQUEST]', {
    originalUrl: req.originalUrl,
    normalizedPath,
    requestedPath,
    ip: req.ip,
    time: new Date().toISOString()
  });

  // Ensure the requested path is within uploads directory
  if (!requestedPath.startsWith(uploadsDir)) {
    console.warn('[STATIC IMAGE] Invalid path requested, serving placeholder', {
      requestedPath,
      uploadsDir,
      ip: req.ip,
      time: new Date().toISOString()
    });
    return res.sendFile(placeholderPath);
  }

  // Check if file exists
  if (!fs.existsSync(requestedPath)) {
    console.warn('[STATIC IMAGE] File not found, serving placeholder', {
      requestedPath,
      ip: req.ip,
      time: new Date().toISOString()
    });
    return res.sendFile(placeholderPath);
  }

  // File exists, serve it
  console.log('[STATIC IMAGE] Serving file', {
    requestedPath,
    ip: req.ip,
    time: new Date().toISOString()
  });
  res.sendFile(requestedPath, (err) => {
    if (err) {
      console.error('[STATIC IMAGE] Error sending file', {
        requestedPath,
        error: err.message,
        stack: err.stack,
        ip: req.ip,
        time: new Date().toISOString()
      });
    } else {
      console.log('[STATIC IMAGE] File sent successfully', {
        requestedPath,
        ip: req.ip,
        time: new Date().toISOString()
      });
    }
  });
});

// Frontend route handling - only for non-API and non-upload routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  // Only redirect if it's not an API or upload request
  res.redirect(302, `http://localhost:5173${req.path}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid or expired token'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: err.message
    });
  }

  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'File not found',
      message: 'The requested file could not be found'
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: 'File size should not exceed 5MB'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://gang2024gang:fvqTmwTxLLUxr69S@cluster0.h92s2c9.mongodb.net/yoga-center?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to MongoDB successfully");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:5173`);
    console.log(`Backend: http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Helper function to ensure event directory exists
const ensureEventDirectory = (event) => {
  const eventDir = path.join(eventsDir, event.category, event._id.toString());
  if (!fs.existsSync(eventDir)) {
    fs.mkdirSync(eventDir, { recursive: true });
    console.log(`Created directory for event: ${eventDir}`);
  }
  return eventDir;
};
