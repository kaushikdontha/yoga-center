import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Event Schema with nested photos
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: String,
  duration: String,
  instructor: String,
  capacity: Number,
  price: Number,
  category: { 
    type: String, 
    required: true,
    enum: ['workshop', 'class', 'retreat', 'general', 'gallery'],
    default: 'general'
  },
  image: {
    type: String,
    default: '/uploads/placeholder.jpg'
  },
  photos: [{
    path: {
      type: String,
      required: true
    },
    title: String,
    description: String,
    order: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  registeredUsers: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps on save
EventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update timestamps on update
EventSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Virtual for folder path
EventSchema.virtual('folderPath').get(function() {
  return `events/${this.category}/${this._id}`;
});

// Virtual for full image URL
EventSchema.virtual('imageUrl').get(function() {
  return this.image || '/uploads/placeholder.jpg';
});

// Methods to handle image paths
EventSchema.methods.getPhotoUrl = function(photoId) {
  const photo = this.photos.id(photoId);
  return photo?.path || '/uploads/placeholder.jpg';
};

EventSchema.methods.addPhoto = function(photoPath, title = '', description = '') {
  this.photos.push({
    path: photoPath,
    title,
    description,
    order: this.photos.length
  });
};

// Static method to handle file deletion
EventSchema.statics.deleteEventFiles = async function(eventId) {
  try {
    const event = await this.findById(eventId);
    if (!event) return;

    const eventDir = path.join(process.cwd(), 'uploads', 'events', event.category, event._id.toString());
    if (fs.existsSync(eventDir)) {
      fs.rmSync(eventDir, { recursive: true, force: true });
      console.log(`Deleted event directory: ${eventDir}`);
    }
  } catch (error) {
    console.error('Error deleting event files:', error);
  }
};

const Event = mongoose.model('Event', EventSchema);

export default Event; 