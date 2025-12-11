const express = require('express');
const router = express.Router();
const { getMilestones, createMilestone, updateMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMilestones)
    .post(protect, createMilestone);

router.route('/:id')
    .put(protect, updateMilestone)
    .delete(protect, deleteMilestone);

module.exports = router;
