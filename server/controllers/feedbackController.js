const Feedback = require('../models/Feedback');

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
    try {
        const feedback = new Feedback({
            ...req.body,
            user: req.user._id
        });
        const createdFeedback = await feedback.save();
        res.status(201).json(createdFeedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback
// @access   Private/Admin
const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFeedback,
    getFeedback
};
