const express = require('express');
const router = express.Router();
const { getDetailedReports } = require('../controllers/detailedReportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDetailedReports);

module.exports = router;
