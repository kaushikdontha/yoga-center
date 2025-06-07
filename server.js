import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CATEGORIES = ['workshop', 'class', 'retreat', 'general', 'gallery'];
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  preview: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 }
};
const MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Update base paths
const uploadsDir = path.join(__dirname, "uploads");
const eventsDir = path.join(uploadsDir, "events");
const galleryDir = path.join(uploadsDir, "gallery");
const tempDir = path.join(uploadsDir, "temp");
const cacheDir = path.join(uploadsDir, "cache");

// Create necessary directories
[uploadsDir, eventsDir, galleryDir, tempDir, cacheDir, ...CATEGORIES.map(cat => path.join(eventsDir, cat))]
.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
  }
});

// Initialize Express app
const app = express();

// Request cache with configurable TTL
const requestCache = new NodeCache({ 
  stdTTL: 30,
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: true
});

// In-flight requests tracking
const inFlightRequests = new Map();
const uploadQueue = new Map();
const processingQueue = new Set();

// Utility Functions
const generateUniqueFilename = (originalname, prefix = '') => {
  const ext = path.extname(originalname);
  const uuid = uuidv4();
  return `${prefix}${uuid}${ext}`;
};

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  return dirPath;
};

const cleanupTempFiles = async (files) => {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
        console.log(`Cleaned up temp file: ${file}`);
      }
    } catch (error) {
      console.error(`Error cleaning up temp file ${file}:`, error);
    }
  }
};

const isValidImageFile = (file) => {
  return file && MIME_TYPES[file.mimetype];
};

// Debug function to log in-flight requests
const logInFlightRequests = () => {
  console.log('Current in-flight requests:', {
    count: inFlightRequests.size,
    keys: Array.from(inFlightRequests.keys()),
    timestamp: new Date().toISOString()
  });
};

// Update getCacheKey with logging
const getCacheKey = (req) => {
  const { method, originalUrl, headers } = req;
  const authToken = headers.authorization ? headers.authorization.split(' ')[1] : 'anonymous';
  const key = `${method}:${originalUrl}:${authToken}`;
  console.log('Generated cache key:', {
    key,
    method,
    url: originalUrl,
    hasAuth: !!headers.authorization,
    timestamp: new Date().toISOString()
  });
  return key;
};

const getImageVariantPath = (originalPath, size) => {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const basename = path.basename(originalPath, ext);
  return path.join(dir, `${basename}_${size}${ext}`);
};

const processImage = async (inputPath, outputPath, size) => {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .withMetadata()
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`Generated ${size.width}x${size.height} variant: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error processing image ${inputPath}:`, error);
    return false;
  }
};

const generateImageVariants = async (originalPath) => {
  const variants = {};
  const tempFiles = [];

  try {
    for (const [size, dimensions] of Object.entries(IMAGE_SIZES)) {
      const variantPath = getImageVariantPath(originalPath, size);
      tempFiles.push(variantPath);
      
      if (await processImage(originalPath, variantPath, dimensions)) {
        variants[size] = path.relative(uploadsDir, variantPath).replace(/\\/g, '/');
      }
    }
    
    return variants;
  } catch (error) {
    console.error('Error generating image variants:', error);
    await cleanupTempFiles(tempFiles);
    throw error;
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const { eventId, category } = req.params;
      const actualCategory = category || 'general';
      const uploadPath = path.join(tempDir, actualCategory, eventId || 'temp');
      
      ensureDirectoryExists(uploadPath);
      console.log(`Upload destination: ${uploadPath}`);
      
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      const filename = generateUniqueFilename(file.originalname, 'upload_');
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    } catch (error) {
      console.error('Error in multer filename:', error);
      cb(error);
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (!isValidImageFile(file)) {
    return cb(new Error('Invalid file type. Only JPG, PNG, GIF and WebP images are allowed.'), false);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10
  }
});

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many failed attempts',
    message: 'Please try again in an hour'
  }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    error: 'Upload limit exceeded',
    message: 'Please try again later'
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      upgradeInsecureRequests: null
    }
  }
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

// Static file serving with caching
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoga-center', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Create indexes
  Promise.all([
    Event.collection.createIndex({ title: 'text', description: 'text' }),
    Event.collection.createIndex({ category: 1, date: 1 }),
    Event.collection.createIndex({ createdAt: 1 }),
    Contact.collection.createIndex({ email: 1 }),
    Contact.collection.createIndex({ status: 1, createdAt: 1 })
  ])
  .then(() => console.log('Database indexes created'))
  .catch(err => console.error('Error creating indexes:', err));
})
.catch(err => console.error('MongoDB connection error:', err));

// Import models
import Event from './models/Event.js';
import Contact from './models/Contact.js';

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided',
        message: 'Authentication required' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // For demo purposes - replace with real user lookup
      if (decoded.userId === '1' && decoded.role === 'admin') {
        req.user = {
          _id: '1',
          username: 'Raviyoga',
          role: 'admin'
        };
        return next();
      }
      
      throw new Error('Invalid user');
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ 
        success: false,
        error: 'Authentication failed',
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

// Admin Authorization Middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
};

// Cache Middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = getCacheKey(req);
    const cachedResponse = requestCache.get(key);

    if (cachedResponse) {
      console.log(`Cache hit for ${key}`);
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method
    res.json = function(body) {
      // Restore original method
      res.json = originalJson;
      
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        requestCache.set(key, body, duration);
        console.log(`Cached response for ${key}`);
      }
      
      // Send the response
      return res.json(body);
    };

    next();
  };
};

// Request deduplication middleware with enhanced logging
const dedupeMiddleware = async (req, res, next) => {
  console.log('Deduplication middleware started:', {
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'GET') {
    console.log('Skipping deduplication for non-GET request');
    return next();
  }

  const key = getCacheKey(req);
  
  // Log current state
  console.log('Checking for duplicate request:', {
    key,
    hasExisting: inFlightRequests.has(key)
  });
  logInFlightRequests();
  
  if (inFlightRequests.has(key)) {
    console.log('Duplicate request detected - waiting for original request:', key);
    try {
      const response = await inFlightRequests.get(key);
      console.log('Returning cached response for:', key);
      return res.json(response);
    } catch (error) {
      console.error('Error waiting for in-flight request:', {
        key,
        error: error.message,
        stack: error.stack
      });
      return next(error);
    }
  }

  console.log('New request - creating promise:', key);
  const responsePromise = new Promise((resolve, reject) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method
    res.json = function(body) {
      console.log('Response ready:', {
        key,
        status: res.statusCode,
        timestamp: new Date().toISOString()
      });

      // Restore original method
      res.json = originalJson;
      
      // Resolve the promise with the response body
      resolve(body);
      
      // Remove from in-flight requests after a short delay
      setTimeout(() => {
        console.log('Cleaning up request:', key);
        inFlightRequests.delete(key);
        logInFlightRequests();
      }, 100);
      
      // Send the response
      return res.json(body);
    };

    // Handle errors
    res.on('error', (error) => {
      console.error('Response error:', {
        key,
        error: error.message,
        stack: error.stack
      });
      reject(error);
      inFlightRequests.delete(key);
      logInFlightRequests();
    });

    // Handle request completion
    res.on('finish', () => {
      console.log('Request finished:', {
        key,
        status: res.statusCode,
        timestamp: new Date().toISOString()
      });
    });

    // Handle request close/abort
    res.on('close', () => {
      console.log('Request closed:', {
        key,
        status: res.statusCode,
        timestamp: new Date().toISOString()
      });
      inFlightRequests.delete(key);
      logInFlightRequests();
    });

    next();
  });

  // Store the promise
  inFlightRequests.set(key, responsePromise);
  console.log('Added request to in-flight map:', key);
  logInFlightRequests();
};

// Upload Queue Middleware
const queueUploadMiddleware = async (req, res, next) => {
  const key = `${req.user._id}:${Date.now()}`;
  
  if (uploadQueue.size >= 10) {
    return res.status(429).json({
      success: false,
      error: 'Upload queue full',
      message: 'Please try again later'
    });
  }

  const uploadPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      uploadQueue.delete(key);
      reject(new Error('Upload timeout'));
    }, 5 * 60 * 1000); // 5 minutes timeout

    req.on('end', () => {
      clearTimeout(timeout);
      uploadQueue.delete(key);
      resolve();
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      uploadQueue.delete(key);
      reject(error);
    });
  });

  uploadQueue.set(key, uploadPromise);
  
  try {
    await uploadPromise;
    next();
  } catch (error) {
    next(error);
  }
};

// Image Processing Queue Middleware
const queueProcessingMiddleware = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files || [req.file];
  const key = `${req.user._id}:${files.map(f => f.filename).join(',')}`;

  if (processingQueue.size >= 5) {
    return res.status(429).json({
      success: false,
      error: 'Processing queue full',
      message: 'Please try again later'
    });
  }

  processingQueue.add(key);

  res.on('finish', () => {
    processingQueue.delete(key);
  });

  next();
};

// Validation Middleware
const validateEventData = (req, res, next) => {
  const { title, description, date, category } = req.body;

  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!date || isNaN(new Date(date).getTime())) {
    errors.push('Valid date is required');
  }

  if (category && !CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${CATEGORIES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: errors.join('. ')
    });
  }

  next();
};

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user?._id
  });

  // Clean up any uploaded files
  if (req.file) {
    cleanupTempFiles([req.file.path]);
  }
  if (req.files) {
    cleanupTempFiles(req.files.map(f => f.path));
  }

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
      message: `File size should not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'Too many files',
      message: 'Maximum 10 files can be uploaded at once'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

// Health Check Endpoint
app.get('/api/health', [
  authenticateToken,
  dedupeMiddleware,
  cacheMiddleware(5)
], (req, res) => {
  console.log('Health check requested:', {
    user: req.user?._id,
    timestamp: new Date().toISOString()
  });
  
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  };

  console.log('Health check response:', {
    status: healthData.status,
    uptime: healthData.uptime,
    timestamp: healthData.timestamp
  });

  res.json(healthData);
});

// Auth Endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // For demo purposes - replace with real auth
    if (username === 'admin' && password === 'password') {
      const user = { 
        id: '1',
        username: 'Raviyoga',
        role: 'admin'
      };
      
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { 
          expiresIn: '24h',
          audience: 'yoga-center-api',
          issuer: 'yoga-center-auth'
        }
      );

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Events Endpoints
app.get('/api/events', [
  authenticateToken,
  dedupeMiddleware,
  cacheMiddleware(30)
], async (req, res, next) => {
  console.log('Events requested:', {
    query: req.query,
    user: req.user?._id,
    timestamp: new Date().toISOString()
  });

  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      search,
      startDate,
      endDate,
      sort = 'date'
    } = req.query;

    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    console.log('Executing events query:', {
      query,
      sort,
      page,
      limit
    });

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-__v')
        .lean(),
      Event.countDocuments(query)
    ]);

    console.log('Events query completed:', {
      count: events.length,
      total,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

app.get('/api/events/:id', [authenticateToken, cacheMiddleware(30)], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    next(error);
  }
});

app.post('/api/events', [
  authenticateToken, 
  adminMiddleware,
  uploadLimiter,
  queueUploadMiddleware,
  queueProcessingMiddleware,
  upload.single('image'),
  validateEventData
], async (req, res) => {
  const uploadedFiles = [];
  
  try {
    const eventData = { ...req.body };
    
    // Create event
    const event = new Event(eventData);
    await event.save();
    
    // Handle image upload
    if (req.file) {
      const category = eventData.category || 'general';
      const eventDir = path.join(eventsDir, category, event._id.toString(), 'cover');
      ensureDirectoryExists(eventDir);
      
      // Generate image variants
      const variants = await generateImageVariants(req.file.path);
      
      // Move original file
      const originalDest = path.join(eventDir, req.file.filename);
      await fs.promises.rename(req.file.path, originalDest);
      uploadedFiles.push(originalDest);
      
      // Update event with image paths
      event.image = {
        original: path.relative(uploadsDir, originalDest).replace(/\\/g, '/'),
        ...variants
      };
      
      await event.save();
    }
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    await cleanupTempFiles(uploadedFiles);
    next(error);
  }
});

app.put('/api/events/:id', [
  authenticateToken,
  adminMiddleware,
  uploadLimiter,
  queueUploadMiddleware,
  queueProcessingMiddleware,
  upload.single('image'),
  validateEventData
], async (req, res) => {
  const uploadedFiles = [];
  
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'The event to update does not exist'
      });
    }

    const updateData = { ...req.body };
    
    // Handle image update
    if (req.file) {
      // Delete old images
      if (event.image) {
        const oldImagePath = path.join(uploadsDir, event.image.original);
        const oldVariants = Object.values(event.image)
          .filter(p => p !== event.image.original)
          .map(p => path.join(uploadsDir, p));
        
        await cleanupTempFiles([oldImagePath, ...oldVariants]);
      }
      
      const category = updateData.category || event.category || 'general';
      const eventDir = path.join(eventsDir, category, event._id.toString(), 'cover');
      ensureDirectoryExists(eventDir);
      
      // Generate image variants
      const variants = await generateImageVariants(req.file.path);
      
      // Move original file
      const originalDest = path.join(eventDir, req.file.filename);
      await fs.promises.rename(req.file.path, originalDest);
      uploadedFiles.push(originalDest);
      
      // Update image paths
      updateData.image = {
        original: path.relative(uploadsDir, originalDest).replace(/\\/g, '/'),
        ...variants
      };
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    await cleanupTempFiles(uploadedFiles);
    next(error);
  }
});

app.delete('/api/events/:id', [authenticateToken, adminMiddleware], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Delete associated files
    const category = event.category || 'general';
    const eventDir = path.join(eventsDir, category, event._id.toString());
    if (fs.existsSync(eventDir)) {
      await fs.promises.rm(eventDir, { recursive: true, force: true });
      console.log('Deleted event directory:', eventDir);
    }

    // Delete from database
    await Event.findByIdAndDelete(req.params.id);
    
    // Invalidate cache
    const cacheKeys = requestCache.keys().filter(key => key.includes(`/api/events/${req.params.id}`));
    cacheKeys.forEach(key => requestCache.del(key));
    
    res.json({
      success: true,
      message: 'Event deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    next(error);
  }
});

// Contact Form Endpoint
app.post('/api/contact', [
  apiLimiter,
  express.json({ limit: '10kb' })
], async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
}); 