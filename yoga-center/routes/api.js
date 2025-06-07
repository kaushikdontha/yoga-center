import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Contact from '../models/Contact.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
const eventsDir = path.join(uploadsDir, 'events');

// Create router
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const eventId = req.params.id || 'temp';
      const category = req.body.category || 'general';
      const uploadPath = path.join(eventsDir, category, eventId, 'cover');
      
      // Ensure directory exists
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Upload directory ensured: ${uploadPath}`);
      
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Generate a safe filename with original extension
      const ext = path.extname(file.originalname);
      const filename = `cover${ext}`;  // Using a fixed name for consistency
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
    return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
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

// Configure multer for photo uploads
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const eventId = req.params.id;
    const uploadPath = path.join(process.cwd(), 'uploads', 'events', eventId, 'photos');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const photoUpload = multer({ 
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth middleware - checking token');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded:', decoded);
      
      // For the hardcoded admin case
      if (decoded.userId === '1' && decoded.role === 'admin') {
        req.user = {
          _id: '1',
          username: 'Raviyoga',
          role: 'admin'
        };
        console.log('Admin authenticated');
        return next();
      }

      console.log('Token invalid - not admin');
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message
    });
  }
};

// Admin Middleware
const adminMiddleware = async (req, res, next) => {
  console.log('Admin middleware - checking role');
  if (req.user.role !== 'admin') {
    console.log('Access denied - not admin');
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  console.log('Admin access granted');
  next();
};

// Utility for truncating large objects in logs
function truncate(obj, maxLen = 300) {
  if (typeof obj === 'string') return obj.length > maxLen ? obj.slice(0, maxLen) + '...' : obj;
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
  } catch {
    return obj;
  }
}

// Login Route
router.post('/auth/login', async (req, res) => {
  console.log('[API ENTRY] POST /auth/login', { body: truncate(req.body), ip: req.ip, time: new Date().toISOString() });
  try {
    const { username, password } = req.body;

    // Log request data
    console.log('Login attempt:', { username });

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Username and password are required'
      });
    }

    // For the hardcoded admin case
    if (username.trim() === 'Raviyoga' && password === 'RaviYoga@924') {
      // Generate JWT token
      const token = jwt.sign(
        { userId: '1', role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Log successful login
      console.log('[API EXIT] POST /auth/login success', { username, ip: req.ip, time: new Date().toISOString() });

      // Return success response with consistent structure
      return res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: '1',
            username: 'Raviyoga',
            role: 'admin'
          }
        },
        message: 'Login successful'
      });
    }

    // Log failed attempt
    console.log('[API EXIT] POST /auth/login fail', { username, ip: req.ip, time: new Date().toISOString() });

    // Return error for invalid credentials
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid username or password'
    });
  } catch (error) {
    // Log error details
    console.error('[API ERROR] POST /auth/login', { error: error.message, stack: error.stack, ip: req.ip, time: new Date().toISOString() });

    // Return error response with consistent structure
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message || 'An unexpected error occurred during login'
    });
  }
});

// Protected Routes
router.get('/health', authMiddleware, (req, res) => {
  console.log('[API ENTRY] GET /health', { user: req.user, ip: req.ip, time: new Date().toISOString() });
  res.json({ 
    status: 'ok',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
  console.log('[API EXIT] GET /health', { user: req.user, ip: req.ip, time: new Date().toISOString() });
});

// Events Routes
// Get all events
router.get('/events', async (req, res) => {
  console.log('[API ENTRY] GET /events', { query: req.query, ip: req.ip, time: new Date().toISOString() });
  try {
    console.log('Fetching all events');
    const events = await Event.find().sort({ date: 1 });
    console.log('[API EXIT] GET /events', { count: events.length, ip: req.ip, time: new Date().toISOString() });
    res.json(events);
  } catch (error) {
    console.error('[API ERROR] GET /events', { error: error.message, stack: error.stack, ip: req.ip, time: new Date().toISOString() });
    res.status(500).json({ 
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// Get single event
router.get('/events/:id', async (req, res) => {
  console.log('[API ENTRY] GET /events/:id', { params: req.params, ip: req.ip, time: new Date().toISOString() });
  try {
    console.log('Fetching event:', req.params.id);
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log('[API EXIT] GET /events/:id not found', { id: req.params.id, ip: req.ip, time: new Date().toISOString() });
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }
    console.log('[API EXIT] GET /events/:id found', { id: event._id, ip: req.ip, time: new Date().toISOString() });
    res.json(event);
  } catch (error) {
    console.error('[API ERROR] GET /events/:id', { error: error.message, stack: error.stack, ip: req.ip, time: new Date().toISOString() });
    res.status(500).json({ 
      error: 'Failed to fetch event',
      message: error.message
    });
  }
});

// Create event with file upload
router.post('/events', [authMiddleware, adminMiddleware], upload.single('image'), async (req, res) => {
  try {
    console.log('Creating new event:', req.body);
    
    const eventData = { ...req.body };
    
    // Create the event first to get the ID
    const event = new Event(eventData);
    await event.save();
    
    // If file uploaded, set image path and move files
    if (req.file) {
      const category = eventData.category || 'general';
      const eventDir = path.join(eventsDir, category, event._id.toString(), 'cover');
      const relativePath = path.relative(uploadsDir, path.join(eventDir, req.file.filename)).replace(/\\/g, '/');
      event.image = `/uploads/${relativePath}`;
      await event.save();
      
      console.log('Image path saved:', event.image);
    }
    
    console.log('Event created:', event._id);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      message: error.message
    });
  }
});

// Update event with file upload
router.put('/events/:id', [authMiddleware, adminMiddleware], upload.single('image'), async (req, res) => {
  try {
    console.log('Updating event:', req.params.id);
    
    // Find existing event
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log('Event not found for update');
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The event to update does not exist'
      });
    }

    // Update event data
    const updateData = { ...req.body };
    
    // If new file uploaded, update image path
    if (req.file) {
      // Delete old image if it exists
      if (event.image) {
        const oldImagePath = path.join(uploadsDir, event.image.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Deleted old image:', oldImagePath);
        }
      }
      
      const category = updateData.category || event.category || 'general';
      const eventDir = path.join(eventsDir, category, event._id.toString(), 'cover');
      const relativePath = path.relative(uploadsDir, path.join(eventDir, req.file.filename)).replace(/\\/g, '/');
      updateData.image = `/uploads/${relativePath}`;
      console.log('Updated image path:', updateData.image);
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Event updated successfully');
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      error: 'Failed to update event',
      message: error.message
    });
  }
});

// Delete event
router.delete('/events/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    console.log('Deleting event:', req.params.id);
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Delete associated files
    const category = event.category || 'general';
    const eventDir = path.join(eventsDir, category, event._id.toString());
    if (fs.existsSync(eventDir)) {
      fs.rmSync(eventDir, { recursive: true, force: true });
      console.log('Deleted event directory:', eventDir);
    }

    // Delete from database
    await Event.findByIdAndDelete(req.params.id);
    console.log('Event deleted:', req.params.id);
    
    res.json({ 
      message: 'Event deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      error: 'Failed to delete event',
      message: error.message
    });
  }
});

// Contact Routes
router.post('/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: 'Message received!' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to save contact message',
      message: error.message
    });
  }
});

router.get('/contacts', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

// GET all photos for gallery and admin
router.get('/photos', async (req, res) => {
  try {
    const events = await Event.find();
    // Flatten all photos from all events and add a timestamp for sorting
    const photos = events.flatMap(event =>
      (event.photos || []).map(photo => ({
        _id: photo._id,
        eventId: event._id,
        eventTitle: event.title,
        // Assuming 'category' might be a field in Event or photo for filtering
        category: event.category, 
        title: photo.title,
        description: photo.description,
        filename: photo.path ? photo.path.split('/').pop() : '',
        url: photo.url || (photo.path && photo.path.startsWith('/uploads/') ? photo.path : `/uploads/events/${event._id}/photos/${photo.path}`),
        // Extract timestamp from ObjectId. MongoDB's ObjectId stores creation time.
        createdAt: photo._id.getTimestamp()
      }))
    );

    // Sort photos by creation date (most recent first)
    photos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Log all photo URLs for debugging
    console.log('[API DEBUG] /api/photos returning URLs (sorted):', photos.map(p => p.url));
    res.json({ photos });
  } catch (error) {
    console.error('[API ERROR] GET /api/photos', { error: error.message, stack: error.stack, ip: req.ip, time: new Date().toISOString() });
    res.status(500).json({ error: 'Failed to fetch photos', message: error.message });
  }
});

// POST upload a gallery photo to an event
router.post('/events/:id/photos', photoUpload.single('photo'), async (req, res) => {
  try {
    console.log('[PHOTO UPLOAD] Incoming request', {
      eventId: req.params.id,
      file: req.file,
      body: req.body,
      time: new Date().toISOString()
    });

    const event = await Event.findById(req.params.id);
    if (!event) {
      console.error('[PHOTO UPLOAD] Event not found', { eventId: req.params.id });
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!req.file) {
      console.error('[PHOTO UPLOAD] No file uploaded', { eventId: req.params.id });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Add photo to event's photos array
    const photoUrl = `/uploads/events/${req.params.id}/photos/${req.file.filename}`;
    event.photos.push({ 
      url: photoUrl, 
      title: req.body.title || '', 
      description: req.body.description || '' 
    });
    
    await event.save();
    
    console.log('[PHOTO UPLOAD] Photo uploaded and saved to event', {
      eventId: req.params.id,
      photoUrl
    });
    
    res.status(201).json({ message: 'Photo uploaded', photo: photoUrl });
  } catch (error) {
    console.error('[API ERROR] POST /events/:id/photos', {
      error: error.message,
      stack: error.stack,
      eventId: req.params.id,
      file: req.file,
      body: req.body,
      time: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to upload photo', message: error.message });
  }
});

// Delete photo from event
router.delete('/events/:eventId/photos/:photoId', async (req, res) => {
  try {
    console.log('[PHOTO DELETE] Starting deletion process', {
      eventId: req.params.eventId,
      photoId: req.params.photoId,
      time: new Date().toISOString()
    });

    // Find the event
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      console.error('[PHOTO DELETE] Event not found:', req.params.eventId);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('[PHOTO DELETE] Found event:', {
      eventId: event._id,
      photosCount: event.photos?.length || 0,
      photos: event.photos
    });

    // Find the photo in the event's photos array
    const photo = event.photos.find(p => p._id.toString() === req.params.photoId);
    if (!photo) {
      console.error('[PHOTO DELETE] Photo not found in event:', {
        eventId: req.params.eventId,
        photoId: req.params.photoId,
        availablePhotoIds: event.photos.map(p => p._id.toString())
      });
      return res.status(404).json({ error: 'Photo not found' });
    }

    console.log('[PHOTO DELETE] Found photo:', {
      photoId: photo._id,
      photoUrl: photo.url,
      photo: photo
    });

    // Remove file from disk
    try {
      // Get the file path from either url or path property
      const filePath = photo.url || photo.path;
      
      if (!filePath) {
        console.warn('[PHOTO DELETE] No file path found in photo object:', photo);
      } else {
        // Remove leading slash if present
        const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const fullPath = path.join(process.cwd(), relativePath);
        
        console.log('[PHOTO DELETE] Attempting to delete file:', {
          originalPath: filePath,
          relativePath,
          fullPath
        });
        
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('[PHOTO DELETE] File deleted successfully');
        } else {
          console.warn('[PHOTO DELETE] File not found on disk:', fullPath);
        }
      }
    } catch (fileError) {
      console.error('[PHOTO DELETE] Error deleting file:', {
        error: fileError.message,
        stack: fileError.stack
      });
      // Continue with database deletion even if file deletion fails
    }

    // Remove photo from array using filter
    event.photos = event.photos.filter(p => p._id.toString() !== req.params.photoId);
    
    console.log('[PHOTO DELETE] Updating event in database');
    await event.save();
    
    console.log('[PHOTO DELETE] Photo removed from event successfully');
    res.json({ 
      message: 'Photo deleted successfully',
      eventId: event._id,
      photoId: req.params.photoId
    });

  } catch (error) {
    console.error('[PHOTO DELETE] Error:', {
      message: error.message,
      stack: error.stack,
      eventId: req.params.eventId,
      photoId: req.params.photoId,
      time: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Failed to delete photo', 
      message: error.message,
      details: error.stack
    });
  }
});

// Gallery endpoint: get all events with their photos
router.get('/gallery', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery', message: error.message });
  }
});

export default router; 