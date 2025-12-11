const Project = require('../models/Project');
const Task = require('../models/Task');

const User = require('../models/User');

// @desc    Get detailed reports with date filtering
// @route   GET /api/reports/detailed
// @access  Private
const getDetailedReports = async (req, res) => {
    try {
        const { startDate, endDate, projectId, department } = req.query;
        let dateFilter = {};
        let projectFilter = {};

        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Project Filter
        if (projectId) {
            projectFilter._id = projectId;
        }

        // Department Filter (find users in department, then projects owned by them)
        if (department) {
            const usersInDept = await User.find({ department }).select('_id');
            const userIds = usersInDept.map(u => u._id);
            projectFilter.owner = { $in: userIds };
        }

        // Combine filters for Projects
        const finalProjectFilter = { ...dateFilter, ...projectFilter };

        // Projects created in range (and matching filters)
        const projectsCreated = await Project.countDocuments(finalProjectFilter);
        const projectsCompleted = await Project.countDocuments({
            ...finalProjectFilter,
            status: 'Completed'
        });

        // Tasks created in range (need to filter tasks by the filtered projects)
        // First get the list of relevant project IDs
        const relevantProjects = await Project.find(finalProjectFilter).select('_id');
        const relevantProjectIds = relevantProjects.map(p => p._id);

        const taskFilter = {
            ...dateFilter,
            project: { $in: relevantProjectIds }
        };

        const tasksCreated = await Task.countDocuments(taskFilter);
        const tasksCompleted = await Task.countDocuments({
            ...taskFilter,
            status: 'Done'
        });

        const projectStatusDist = await Project.aggregate([
            { $match: finalProjectFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const taskPriorityDist = await Task.aggregate([
            { $match: taskFilter },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            projectsCreated,
            projectsCompleted,
            tasksCreated,
            tasksCompleted,
            projectStatusDist,
            taskPriorityDist,
            dateRange: { startDate, endDate }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDetailedReports
};
