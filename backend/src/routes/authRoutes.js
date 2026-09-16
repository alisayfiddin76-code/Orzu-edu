const express = require('express');
const authController = require('../controllers/authController');
const publicAuthController = require('../controllers/publicAuthController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/public-login', publicAuthController.publicLogin);
router.post('/parent-login', publicAuthController.parentLogin);

// Protected auth endpoints
router.patch('/update-password', authMiddleware.protect, authController.updatePassword);

module.exports = router;
