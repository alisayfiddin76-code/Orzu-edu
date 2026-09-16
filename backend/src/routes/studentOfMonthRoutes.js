const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/studentOfMonthController');
const { protect } = require('../middlewares/authMiddleware');

// Faqat GET – avtomatik reyting
// GET /api/v1/student-of-month?period=month&limit=10
router.get('/', protect, ctrl.getAutoRanking);

// GET /api/v1/student-of-month/teachers?period=month&limit=10
router.get('/teachers', protect, ctrl.getTeacherRanking);

module.exports = router;
