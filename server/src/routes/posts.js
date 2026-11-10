import { Router } from 'express';
import { body, param, query } from 'express-validator';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { categories } from '../models/Campaign.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { assertOwner } from '../utils/authorization.js';

const router = Router();
const postFields = (patch = false) => {
  const rule = (chain) => patch ? chain.optional() : chain;
  return [
    rule(body('title').trim().isLength({ min: 4, max: 140 })),
    rule(body('content').trim().isLength({ min: 10, max: 5000 })),
    rule(body('category').isIn(categories)),
    body('image').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true })
  ];
};

router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  validate
], asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = req.user?.role === 'admin' ? {} : req.user ? { $or: [{ moderationStatus: 'approved' }, { author: req.user.id }] } : { moderationStatus: 'approved' };
  if (search) filter.$text = { $search: String(search).slice(0, 100) };
  const [posts, total] = await Promise.all([
    Post.find(filter).populate('author', 'name profileImage').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(filter)
  ]);
  const comments = posts.length ? await Comment.find({ post: { $in: posts.map((post) => post.id) } })
    .populate('author', 'name profileImage').sort({ createdAt: 1 }) : [];
  const commentsByPost = new Map();
  for (const comment of comments) {
    const key = String(comment.post);
    commentsByPost.set(key, [...(commentsByPost.get(key) || []), comment]);
  }
  const items = posts.map((post) => ({ ...post.toJSON(), comments: commentsByPost.get(post.id) || [] }));
  res.json({ success: true, data: { posts: items, page, pages: Math.ceil(total / limit), total } });
}));

router.post('/', requireAuth, [...postFields(), validate], asyncHandler(async (req, res) => {
  const { title, content, category, image = '' } = req.body;
  const post = await Post.create({ title, content, category, image, author: req.user.id });
  res.status(201).json({ success: true, data: { post } });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { posts } });
}));

router.get('/:id', optionalAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name profileImage');
  if (!post || (post.moderationStatus !== 'approved' && req.user?.role !== 'admin' && String(post.author._id) !== req.user?.id)) {
    throw new HttpError(404, 'Post not found.');
  }
  const comments = await Comment.find({ post: post.id }).populate('author', 'name profileImage').sort({ createdAt: 1 });
  res.json({ success: true, data: { post, comments } });
}));

router.patch('/:id', requireAuth, [...postFields(true), param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found.');
  assertOwner(post.author, req.user, 'You cannot edit this post.');
  for (const key of ['title', 'content', 'category', 'image']) if (req.body[key] !== undefined) post[key] = req.body[key];
  await post.save();
  res.json({ success: true, data: { post } });
}));

router.delete('/:id', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found.');
  assertOwner(post.author, req.user, 'You cannot delete this post.');
  await Promise.all([post.deleteOne(), Comment.deleteMany({ post: post.id })]);
  res.json({ success: true, message: 'Post deleted.' });
}));

router.post('/:id/like', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, moderationStatus: 'approved' },
    { $addToSet: { likes: req.user.id } },
    { new: true }
  );
  if (!post) throw new HttpError(404, 'Post not found.');
  res.json({ success: true, data: { likeCount: post.likes.length, liked: true } });
}));

router.delete('/:id/like', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { likes: req.user.id } },
    { new: true }
  );
  if (!post) throw new HttpError(404, 'Post not found.');
  res.json({ success: true, data: { likeCount: post.likes.length, liked: false } });
}));

router.post('/:postId/comments', requireAuth, [
  param('postId').isMongoId(),
  body('content').trim().isLength({ min: 1, max: 1000 }),
  validate
], asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.postId, moderationStatus: 'approved' });
  if (!post) throw new HttpError(404, 'Post not found.');
  const comment = await Comment.create({ post: post.id, author: req.user.id, content: req.body.content });
  await comment.populate('author', 'name profileImage');
  res.status(201).json({ success: true, data: { comment } });
}));

router.post('/:id/report', requireAuth, [param('id').isMongoId(), validate], asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, moderationStatus: 'approved', reportedBy: { $ne: req.user.id } },
    { $addToSet: { reportedBy: req.user.id }, $set: { moderationStatus: 'pending' } },
    { new: true }
  );
  if (!post) throw new HttpError(404, 'Post is unavailable or you have already reported it.');
  res.json({ success: true, message: 'Thanks. This post has been sent to our moderation team.' });
}));

export default router;
