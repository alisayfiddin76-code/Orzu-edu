const express = require('express');
const { sendMessage, getMessages, getChatUsers } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware'); // assuming we have protect middleware

const router = express.Router();

router.use(protect); // All chat routes are protected

router.post('/send', sendMessage);
router.get('/users', getChatUsers);
router.get('/messages/:userId', getMessages);

module.exports = router;
