const express = require('express');
const contactSettingsController = require('../controllers/contactSettingsController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public — hamma o'qiy oladi
router.get('/', contactSettingsController.getContactSettings);

// Protected — faqat SUPER_ADMIN tahrirlaydi
router.patch('/', protect, restrictTo('SUPER_ADMIN'), contactSettingsController.updateContactSettings);

module.exports = router;
