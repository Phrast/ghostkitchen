const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getStats, getMargins } = require('../controllers/dashboardController');

router.get('/stats', auth, getStats);
router.get('/margins', auth, getMargins);

module.exports = router;
