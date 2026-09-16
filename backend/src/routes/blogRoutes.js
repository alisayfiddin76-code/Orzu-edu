const express = require('express');
const blogController = require('../controllers/blogController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { upload, setCategory } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/:slug', blogController.getPostBySlug);

// Admin routes
router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'MANAGER'));

router.get('/admin/all', blogController.getAllPostsAdmin);
router.post('/', setCategory('blog'), upload.single('image'), blogController.createPost);
router.patch('/:id', setCategory('blog'), upload.single('image'), blogController.updatePost);
router.delete('/:id', blogController.deletePost);

module.exports = router;
