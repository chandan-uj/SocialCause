import { Router } from 'express';
import { param } from 'express-validator';
import VolunteerRegistration from '../models/VolunteerRegistration.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { registerVolunteer } from '../services/volunteerService.js';

const router = Router();

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const registrations = await VolunteerRegistration.find({ user: req.user.id })
    .populate('campaign').sort({ updatedAt: -1 });
  res.json({ success: true, data: { registrations } });
}));

router.post('/:campaignId', requireAuth, [param('campaignId').isMongoId(), validate], asyncHandler(async (req, res) => {
  const result = await registerVolunteer({ campaignId: req.params.campaignId, userId: req.user.id });
  res.status(result.created ? 201 : 200).json({ success: true, data: { registration: result.registration } });
}));

router.delete('/:registrationId', requireAuth, [param('registrationId').isMongoId(), validate], asyncHandler(async (req, res) => {
  const registration = await VolunteerRegistration.findOneAndUpdate(
    { _id: req.params.registrationId, user: req.user.id, status: 'registered' },
    { $set: { status: 'cancelled' } },
    { new: true }
  );
  if (!registration) throw new HttpError(404, 'Active registration not found.');
  await Campaign.updateOne({ _id: registration.campaign }, { $inc: { volunteerCount: -1 } });
  res.json({ success: true, message: 'Volunteer registration cancelled.' });
}));

export default router;
