import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  status: { type: String, enum: ['registered', 'cancelled'], default: 'registered' }
}, { timestamps: true });
schema.index({ user: 1, campaign: 1 }, { unique: true });
schema.index({ campaign: 1, status: 1 });
export default mongoose.model('VolunteerRegistration', schema);
