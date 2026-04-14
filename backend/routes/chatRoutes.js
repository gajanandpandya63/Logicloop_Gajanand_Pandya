const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
router.post('/summarize', chatController.summarizeChat);

module.exports = router;
