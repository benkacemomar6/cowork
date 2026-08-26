const express = require('express');
const router = express.Router();
const {
    stats,
    alluser,
    banUnban,
    getUser,
    moderateJob,
    listJobs,
    removeFlaggedJob
} = require('../controllers/adminControllers');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.use(authenticate, requireRole('admin'));

router.get('/stats', stats);
router.get('/users', alluser);
router.get('/users/:userId', getUser);
router.patch('/users/:userId/ban', banUnban);
router.get('/jobs', listJobs);
router.patch('/jobs/:jobId/moderate', moderateJob);
router.delete('/jobs/:jobId', removeFlaggedJob);

module.exports = router;
