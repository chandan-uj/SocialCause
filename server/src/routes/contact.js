import { Router } from 'express';
import { body } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('subject').trim().isLength({ min: 3, max: 140 }),
  body('message').trim().isLength({ min: 10, max: 3000 }),
  validate
], asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ success: true, message: 'Your message has been received. Our team will review it shortly.' });
}));
export default router;
