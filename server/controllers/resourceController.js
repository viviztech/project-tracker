const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get resource workload (tasks per user)
// @route   GET /api/reports/workload
// @access  Private
const getResourceWorkload = async (req, res) => {
    try {
        const workload = await Task.aggregate([
            {
                $group: {
                    _id: '$assignee', // Group by assignee ID
                    count: { $sum: 1 }, // Count tasks
                    tasks: { $push: { title: '$title', status: '$status' } }
                }
            },
            {
                $lookup: {
                    from: 'users', // Collection name for users
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user' // Unwind the user array
            },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    count: 1,
                    tasks: 1
                }
            }
        ]);

        res.json(workload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getResourceWorkload
};
