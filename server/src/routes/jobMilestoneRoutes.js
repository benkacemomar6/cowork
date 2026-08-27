const express = require('express');
const router = express.Router({ mergeParams: true });
const { create, list } = require('../controllers/milestoneControllers');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
router.post('/', authenticate, requireRole('client'), create); // your route here — only the job owner (client) should create milestones
router.get('/', list); // public — same access level as viewing the job itself
module.exports = router;