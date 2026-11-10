import { Router } from 'express';
import { body, param, query } from 'express-validator';
import Campaign, { categories } from '../models/Campaign.js';
import VolunteerRegistration from '../models/VolunteerRegistration.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { assertCampaignStatusTransition } from '../utils/campaignStatus.js';
import { assertOwner } from '../utils/authorization.js';

const router = Router();
const campaignFields = (patch = false) => {
  const rule = (chain) => patch ? chain.optional() : chain;
  return [
    rule(body('title').trim().isLength({ min: 5, max: 120 })),
    rule(body('shortDescription').trim().isLength({ min: 10, max: 240 })),
    rule(body('description').trim().isLength({ min: 20, max: 6000 })),
    rule(body('category').isIn(categories)),
    rule(body('location').trim().isLength({ min: 2, max: 120 })),
    rule(body('startDate').isISO8601().toDate()),
    rule(body('endDate').isISO8601().toDate()),
    rule(body('volunteerCapacity').isInt({ min: 1, max: 100000 }).toInt()),
    body('image').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
    body('goals').optional().isArray({ max: 20 }),
    body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled'])
  ];
};
const slugify = (text) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.get('/impact', asyncHandler(async (_req, res) => {
  const [campaigns, activeCampaigns, volunteers] = await Promise.all([
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: 'active' }),
    VolunteerRegistration.countDocuments({ status: 'registered' })
  ]);
  res.json({ success: true, data: { campaigns, activeCampaigns, volunteers } });
}));

router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']),
  validate
], asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, search, category, status, location, sort = 'newest' } = req.query;
  const filter = {};
  if (status === 'draft' && req.user?.role !== 'admin') throw new HttpError(403, 'Administrator access required to view drafts.');
  if (status) filter.status = status;
  else filter.status = 'active';
  if (category && categories.includes(category)) filter.category = category;
  if (location) filter.location = { $regex: String(location).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (search) filter.$text = { $search: String(search).slice(0, 100) };
  const sortOptions = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, endingSoon: { endDate: 1 } };
  const [items, total] = await Promise.all([
    Campaign.find(filter).populate('organizer', 'name profileImage location')
      .sort(sortOptions[sort] || sortOptions.newest).skip((page - 1) * limit).limit(limit),
    Campaign.countDocuments(filter)
  ]);
  res.json({ success: true, data: { items, page, pages: Math.ceil(total / limit), total } });
}));

router.post('/', requireAuth, [...campaignFields(), validate], asyncHandler(async (req, res) => {
  const data = {};
  for (const key of ['title', 'shortDescription', 'description', 'category', 'location', 'startDate', 'endDate', 'volunteerCapacity', 'image', 'goals']) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  data.organizer = req.user.id;
  data.status = req.body.status === 'active' ? 'active' : 'draft';
  data.slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 8)}`;
  const campaign = await Campaign.create(data);
  res.status(201).json({ success: true, data: { campaign } });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ organizer: req.user.id }).sort({ updatedAt: -1 });
  res.json({ success: true, data: { campaigns } });
}));

router.get('/:id', optionalAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('organizer', 'name profileImage location bio');
  if (!campaign) throw new HttpError(404, 'Campaign not found.');
  if (campaign.status === 'draft' && (!req.user || (req.user.role !== 'admin' && String(campaign.organizer._id) !== req.user.id))) {
    throw new HttpError(404, 'Campaign not found.');
  }
  const related = await Campaign.find({ _id: { $ne: campaign.id }, category: campaign.category, status: 'active' }).limit(3);
  res.json({ success: true, data: { campaign, related } });
}));

router.patch('/:id', requireAuth, [...campaignFields(true), param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new HttpError(404, 'Campaign not found.');
  assertOwner(campaign.organizer, req.user, 'You cannot edit this campaign.');
  if (req.body.volunteerCapacity !== undefined && req.body.volunteerCapacity < campaign.volunteerCount) {
    throw new HttpError(400, 'Capacity cannot be lower than the current volunteer count.');
  }
  if (req.body.status) assertCampaignStatusTransition(campaign.status, req.body.status);
  for (const key of ['title', 'shortDescription', 'description', 'category', 'location', 'startDate', 'endDate', 'volunteerCapacity', 'image', 'goals', 'status']) {
    if (req.body[key] !== undefined) campaign[key] = req.body[key];
  }
  await campaign.save();
  if (campaign.status === 'cancelled') {
    await VolunteerRegistration.updateMany({ campaign: campaign.id, status: 'registered' }, { status: 'cancelled' });
    campaign.volunteerCount = 0;
    await campaign.save();
  }
  res.json({ success: true, data: { campaign } });
}));

router.delete('/:id', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new HttpError(404, 'Campaign not found.');
  assertOwner(campaign.organizer, req.user, 'You cannot cancel this campaign.');
  assertCampaignStatusTransition(campaign.status, 'cancelled');
  campaign.status = 'cancelled';
  await campaign.save();
  await VolunteerRegistration.updateMany({ campaign: campaign.id, status: 'registered' }, { status: 'cancelled' });
  campaign.volunteerCount = 0;
  await campaign.save();
  res.json({ success: true, message: 'Campaign cancelled.' });
}));

router.get('/:id/volunteers', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new HttpError(404, 'Campaign not found.');
  assertOwner(campaign.organizer, req.user, 'You cannot view these registrations.');
  const registrations = await VolunteerRegistration.find({ campaign: campaign.id, status: 'registered' }).populate('user', 'name email location');
  res.json({ success: true, data: { registrations } });
}));
export default router;
