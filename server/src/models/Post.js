import mongoose from 'mongoose';
import { categories } from './Campaign.js';

const schema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 4, maxlength: 140 },
  content: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  category: { type: String, required: true, enum: categories },
  image: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true }
}, { timestamps: true });
schema.index({ title: 'text', content: 'text' });
export default mongoose.model('Post', schema);
