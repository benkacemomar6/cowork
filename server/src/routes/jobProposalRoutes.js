const express = require('express');
const router = express.Router({ mergeParams: true });  // note: mergeParams!
const { submit, listAll } = require('../controllers/proposalControllers');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticate, requireRole('freelancer'), submit);
router.get('/', authenticate, listAll);
module.exports = router;