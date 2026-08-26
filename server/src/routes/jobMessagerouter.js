const express = require('express');
const router = express.Router({ mergeParams: true });
const { sendMessageController, getMessagesController } = require('../controllers/messageControler');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, sendMessageController);
router.get('/', authenticate, getMessagesController);

module.exports = router;