const express = require('express');
const router = express.Router({ mergeParams: true });
const { getreview } = require('../controllers/rewieontroler');

router.get('/', getreview);   // public, no authenticate needed

module.exports = router;