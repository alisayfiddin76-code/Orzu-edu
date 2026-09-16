const mongoose = require('mongoose');

/**
 * BlogPost Model
 * Maqolalar, yangiliklar uchun
 */
const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String, // Qisqa tavsif (card uchun)
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      type: String,
      default: null, // Upload path: /uploads/blog/filename.jpg
    },
    author: {
      type: String,
      default: 'ORZU EDU',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BlogPost', BlogPostSchema);
