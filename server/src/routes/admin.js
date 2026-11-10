import { Router } from 'express';
import { param, body } from 'express-validator';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Post from '../models/Post.js';
import VolunteerRegistration from '../models/VolunteerRegistration.js';
import ContactMessage from '../models/ContactMessage.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { assertCampaignStatusTransition } from '../utils/campaignStatus.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/stats', asyncHandler(async (_req, res) => {
  const [users, campaigns, activeCampaigns, volunteers, pendingPosts, recentCampaigns, recentPosts] = await Promise.all([
    User.countDocuments(), Campaign.countDocuments(), Campaign.countDocuments({ status: 'active' }),
    VolunteerRegistration.countDocuments({ status: 'registered' }), Post.countDocuments({ moderationStatus: 'pending' }),
    Campaign.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt'),
    Post.find({ moderationStatus: 'pending' }).sort({ createdAt: -1 }).limit(5).select('title createdAt')
  ]);
  res.json({ success: true, data: { stats: { users, campaigns, activeCampaigns, volunteers, pendingPosts }, recent: { campaigns: recentCampaigns, posts: recentPosts } } });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const [users, total] = await Promise.all([
    User.find().select('name email role location createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments()
  ]);
  res.json({ success: true, data: { users, page, pages: Math.ceil(total / limit), total } });
}));

router.get('/campaigns', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const [campaigns, total] = await Promise.all([
    Campaign.find().populate('organizer', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Campaign.countDocuments()
  ]);
  res.json({ success: true, data: { campaigns, page, pages: Math.ceil(total / limit), total } });
}));

router.patch('/campaigns/:id/status', [
  param('id').isMongoId(), body('status').isIn(['draft', 'active', 'completed', 'cancelled']), validate
], asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new HttpError(404, 'Campaign not found.');
  assertCampaignStatusTransition(campaign.status, req.body.status);
  campaign.status = req.body.status;
  await campaign.save();
  if (campaign.status === 'cancelled') {
    await VolunteerRegistration.updateMany({ campaign: campaign.id, status: 'registered' }, { status: 'cancelled' });
    campaign.volunteerCount = 0;
    await campaign.save();
  }
  res.json({ success: true, data: { campaign } });
}));

router.patch('/users/:id/role', [
  param('id').isMongoId(), body('role').isIn(['user', 'admin']), validate
], asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id && req.body.role !== 'admin') throw new HttpError(400, 'You cannot remove your own administrator access.');
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'User not found.');
  res.json({ success: true, data: { user } });
}));

router.get('/posts/pending', asyncHandler(async (_req, res) => {
  const posts = await Post.find({ moderationStatus: 'pending' }).populate('author', 'name').sort({ createdAt: 1 });
  res.json({ success: true, data: { posts } });
}));

router.patch('/posts/:id/moderation', [
  param('id').isMongoId(), body('status').isIn(['approved', 'rejected']), validate
], asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, {
    moderationStatus: req.body.status,
    reportedBy: []
  }, { new: true, runValidators: true });
  if (!post) throw new HttpError(404, 'Post not found.');
  res.json({ success: true, data: { post } });
}));

router.get('/contact', asyncHandler(async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: { messages } });
}));
export default router;
