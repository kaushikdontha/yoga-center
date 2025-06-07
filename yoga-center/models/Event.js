import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String },
  description: { type: String }
}, { _id: true });

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  photos: [PhotoSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

EventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

EventSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Event = mongoose.model('Event', EventSchema);
export default Event; 