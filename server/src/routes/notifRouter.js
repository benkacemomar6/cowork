const express = require('express');
const router = express.Router();
const { list, markRead } = require('../controllers/notifConrellers');
const { authenticate } = require('../middleware/authMiddleware');
router.get('/', authenticate, list); // GET /api/notifications — protected
router.patch('/:id/read', authenticate, markRead);
module.exports = router;