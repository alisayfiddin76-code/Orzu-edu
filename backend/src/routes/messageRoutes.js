const express = require('express');
const messageController = require('../controllers/messageController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route (Aloqa formasi)
router.post('/', messageController.create);

// Admin routes
router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'MANAGER'));

router.get('/', messageController.getAll);
router.patch('/:id/read', messageController.markRead);
router.delete('/:id', messageController.delete);

module.exports = router;
