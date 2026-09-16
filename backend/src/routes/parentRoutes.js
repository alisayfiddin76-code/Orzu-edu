const express = require('express');
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/v1/parent/dashboard - returns children data for authenticated parent
router.get('/dashboard', authMiddleware.protect, parentController.getParentDashboard);

module.exports = router;
