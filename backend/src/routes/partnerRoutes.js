const express = require('express');
const partnerController = require('../controllers/partnerController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { upload, setCategory } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public route
router.get('/', partnerController.getAll);

// Admin routes
router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'MANAGER'));

router.get('/admin/all', partnerController.getAllAdmin);
router.post('/', setCategory('partners'), upload.single('logo'), partnerController.create);
router.patch('/:id', setCategory('partners'), upload.single('logo'), partnerController.update);
router.delete('/:id', partnerController.delete);

module.exports = router;
