const express = require('express');
const router = express.Router({ mergeParams: true });
const { create } = require('../controllers/milestoneControllers');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
router.post('/', authenticate, requireRole('client'), create); // your route here — only the job owner (client) should create milestones
// your route here — only the job owner (client) should create milestones
module.exports = router;