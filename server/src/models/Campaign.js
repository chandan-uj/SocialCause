import mongoose from 'mongoose';

export const categories = [
  'Agriculture and farmer welfare', 'Education and digital literacy', 'Environmental protection',
  'Poverty alleviation', 'Healthcare awareness', 'Animal welfare', 'Women empowerment', 'Community development'
];
const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
  slug: { type: String, required: true, unique: true, index: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: 240 },
  description: { type: String, required: true, trim: true, maxlength: 6000 },
  category: { type: String, required: true, enum: categories },
  image: { type: String, default: '' },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  volunteerCapacity: { type: Number, required: true, min: 1, max: 100000 },
  volunteerCount: { type: Number, default: 0, min: 0 },
  goals: [{ type: String, trim: true, maxlength: 200 }],
  status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft', index: true }
}, { timestamps: true });
campaignSchema.index({ title: 'text', shortDescription: 'text', description: 'text' });
campaignSchema.pre('validate', function validateDates(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after the start date.');
  }
  next();
});
export default mongoose.model('Campaign', campaignSchema);
