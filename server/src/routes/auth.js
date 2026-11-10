import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();
const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};
function issueCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie('token', token, cookieOptions);
}
const emailField = body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail();

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters.'),
  emailField,
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
  validate
], asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.create({ name, email, passwordHash });
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'An account with this email already exists.');
    throw error;
  }
  issueCookie(res, user.id);
  res.status(201).json({ success: true, data: { user } });
}));

router.post('/login', [
  emailField,
  body('password').isString().notEmpty().withMessage('Password is required.'),
  validate
], asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  issueCookie(res, user.id);
  res.json({ success: true, data: { user: user.toJSON() } });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: 'You have been signed out.' });
});

router.get('/me', requireAuth, (req, res) => res.json({ success: true, data: { user: req.user } }));

router.patch('/profile', requireAuth, [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('location').optional().trim().isLength({ max: 120 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('profileImage').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
  validate
], asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ['name', 'location', 'bio', 'profileImage']) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: { user } });
}));

router.patch('/password', requireAuth, [
  body('currentPassword').isString().notEmpty(),
  body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be at least 8 characters.'),
  validate
], asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'Current password is incorrect.');
  }
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'Password updated successfully.' });
}));

export default router;
