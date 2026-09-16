const express = require('express');
const achievementController = require('../controllers/achievementController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { upload, setCategory } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public route
router.get('/', achievementController.getAll);

// Admin routes
router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'MANAGER'));

router.post('/', setCategory('achievements'), upload.single('certificateImage'), achievementController.create);
router.patch('/:id', setCategory('achievements'), upload.single('certificateImage'), achievementController.update);
router.delete('/:id', achievementController.delete);

module.exports = router;
