import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js';

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- App Setup ---
const app = express();

// Serve static files from the frontend build first
app.use(express.static(path.join(__dirname, 'dist')));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Only apply CORS to API routes
const corsOptions = {
  origin: '*', // Adjust as needed for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use('/api', cors(corsOptions), apiRoutes);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// For any other route, serve index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
