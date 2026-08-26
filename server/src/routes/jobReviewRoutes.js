const express = require('express');
const router = express.Router({ mergeParams: true });
const { create } = require('../controllers/rewieontroler');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, create);

module.exports = router;