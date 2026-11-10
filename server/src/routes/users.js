import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Campaign from '../models/Campaign.js';
import Post from '../models/Post.js';
import VolunteerRegistration from '../models/VolunteerRegistration.js';

const router = Router();
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [campaigns, registrations, posts] = await Promise.all([
    Campaign.countDocuments({ organizer: req.user.id }),
    VolunteerRegistration.countDocuments({ user: req.user.id, status: 'registered' }),
    Post.countDocuments({ author: req.user.id })
  ]);
  res.json({ success: true, data: { user: req.user, summary: { campaigns, registrations, posts } } });
}));
export default router;
