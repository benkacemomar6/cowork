const express = require('express');
const router = express.Router();
const { submit, approve,revision } = require('../controllers/milestoneControllers');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
router.patch('/:id/submit', authenticate, requireRole('freelancer'), submit);
router.patch('/:id/approve', authenticate, requireRole('client'), approve);
router.patch('/:id/revision', authenticate, requireRole('client'), revision);
module.exports = router;