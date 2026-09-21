const express = require('express');
const router = express.Router();
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, startConversation);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
