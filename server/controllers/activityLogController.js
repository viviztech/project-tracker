const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs for a project
// @route   GET /api/activity?projectId=xxx
// @access  Private
const getActivityLogs = async (req, res) => {
    const { projectId } = req.query;
    try {
        const logs = await ActivityLog.find({ project: projectId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an activity log
// @route   POST /api/activity
// @access  Private (usually called internally)
const createActivityLog = async (req, res) => {
    const { project, action, entity, entityId, details } = req.body;
    try {
        const log = new ActivityLog({
            project,
            user: req.user._id,
            action,
            entity,
            entityId,
            details
        });
        const createdLog = await log.save();
        res.status(201).json(createdLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Helper function to log activities (can be called from other controllers)
const logActivity = async (project, user, action, entity, entityId, details) => {
    try {
        const log = new ActivityLog({
            project,
            user,
            action,
            entity,
            entityId,
            details
        });
        await log.save();
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = {
    getActivityLogs,
    createActivityLog,
    logActivity
};
