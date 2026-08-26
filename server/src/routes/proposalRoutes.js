const express = require('express');
const router = express.Router();
const { listMy, accept, reject, withdraw } = require('../controllers/proposalControllers');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/me', authenticate, listMy);
router.patch('/:id/accept', authenticate, accept);
router.patch('/:id/reject', authenticate, reject);
router.delete('/:id', authenticate, withdraw);

module.exports = router;