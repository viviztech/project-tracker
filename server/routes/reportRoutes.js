const express = require('express');
const router = express.Router();
const { getDashboardStats, getWorkloadStats, exportProjectsToCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/workload', protect, getWorkloadStats);
router.get('/export/projects', protect, exportProjectsToCSV);

module.exports = router;
