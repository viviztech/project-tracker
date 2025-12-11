const express = require('express');
const router = express.Router();
const { createFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFeedback)
    .post(protect, createFeedback);

module.exports = router;
