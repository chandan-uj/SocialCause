import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true, maxlength: 140 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['received', 'reviewed'], default: 'received' }
}, { timestamps: true });
export default mongoose.model('ContactMessage', schema);
