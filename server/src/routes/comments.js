import { Router } from 'express';
import { param } from 'express-validator';
import Comment from '../models/Comment.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { assertOwner } from '../utils/authorization.js';

const router = Router();
router.delete('/:id', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new HttpError(404, 'Comment not found.');
  assertOwner(comment.author, req.user, 'You cannot delete this comment.');
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted.' });
}));
export default router;
