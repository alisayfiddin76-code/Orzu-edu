const BlogPost = require('../models/BlogPost');
const AppError = require('../utils/appError');
const path = require('path');

/**
 * Helper: slugdan avtomatik yaratish
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * GET /api/v1/blog
 * Hammaga ochiq — faqat published postlar
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, tag } = req.query;
    const filter = { published: true };
    if (tag) filter.tags = tag;

    const skip = (Number(page) - 1) * Number(limit);
    const posts = await BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-content'); // Ro'yxatda content kerak emas, faqat excerpt

    const total = await BlogPost.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/blog/admin
 * Admin uchun — barcha postlar (published + draft)
 */
exports.getAllPostsAdmin = async (req, res, next) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/blog/:slug
 * Slug bo'yicha bitta post (public)
 */
exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return next(new AppError('Maqola topilmadi', 404));

    // Ko'rishlar sonini oshirish
    await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    res.status(200).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/blog
 * Admin: Yangi post yaratish (rasm bilan)
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, author, tags, published } = req.body;

    if (!title || !content) {
      return next(new AppError('Sarlavha va kontent talab qilinadi', 400));
    }

    let slug = generateSlug(title);
    // Slug takrorlanmasligi uchun tekshirish
    const existingSlug = await BlogPost.findOne({ slug });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    const image = req.file ? `/uploads/blog/${req.file.filename}` : null;

    const tagsArr = tags
      ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()))
      : [];

    const post = await BlogPost.create({
      title,
      slug,
      excerpt: excerpt || '',
      content,
      image,
      author: author || 'ORZU EDU',
      tags: tagsArr,
      published: published === 'true' || published === true,
    });

    res.status(201).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/blog/:id
 * Admin: Post yangilash
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { title, excerpt, content, author, tags, published } = req.body;
    const updateData = {};

    if (title) {
      updateData.title = title;
      // Slug faqat yangi post uchun avtomat yaratiladi, editda o'zgarmaydi
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content) updateData.content = content;
    if (author) updateData.author = author;
    if (tags) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }
    if (published !== undefined) updateData.published = published === 'true' || published === true;
    if (req.file) updateData.image = `/uploads/blog/${req.file.filename}`;

    const post = await BlogPost.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!post) return next(new AppError('Maqola topilmadi', 404));

    res.status(200).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/blog/:id
 * Admin: Post o'chirish
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return next(new AppError('Maqola topilmadi', 404));

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
