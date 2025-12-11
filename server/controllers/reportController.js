const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard summary statistics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();

        const totalProjects = await Project.countDocuments();
        const activeProjects = await Project.countDocuments({ status: 'In Progress' });
        const completedProjects = await Project.countDocuments({ status: 'Completed' });

        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: { $ne: 'Done' } });
        const completedTasks = await Task.countDocuments({ status: 'Done' });

        // Overdue Items
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: today },
            status: { $ne: 'Done' }
        });

        const overdueMilestones = await Milestone.countDocuments({
            dueDate: { $lt: today },
            status: { $ne: 'Completed' }
        });

        // Get recent overdue items for notifications (limit 5)
        const recentOverdueTasks = await Task.find({
            dueDate: { $lt: today },
            status: { $ne: 'Done' }
        })
            .select('title dueDate project')
            .populate('project', 'name')
            .limit(5);

        const recentOverdueMilestones = await Milestone.find({
            dueDate: { $lt: today },
            status: { $ne: 'Completed' }
        })
            .select('title dueDate project')
            .populate('project', 'name')
            .limit(5);

        // Projects by Status
        const projectsByStatus = await Project.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Tasks by Priority
        const tasksByPriority = await Task.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            counts: {
                totalProjects,
                activeProjects,
                completedProjects,
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
                overdueMilestones
            },
            notifications: {
                overdueTasks: recentOverdueTasks,
                overdueMilestones: recentOverdueMilestones
            },
            charts: {
                projectsByStatus,
                tasksByPriority
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get resource workload statistics
// @route   GET /api/reports/workload
// @access  Private
const getWorkloadStats = async (req, res) => {
    try {
        const workload = await Task.aggregate([
            { $match: { status: { $ne: 'Done' } } },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { name: '$user.name', count: 1 } }
        ]);

        res.json(workload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { Parser } = require('json2csv');

// @desc    Export projects to CSV
// @route   GET /api/reports/export/projects
// @access  Private
const exportProjectsToCSV = async (req, res) => {
    try {
        const projects = await Project.find().populate('owner', 'name email');

        const fields = ['name', 'description', 'status', 'priority', 'startDate', 'endDate', 'budget', 'owner.name'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(projects);

        res.header('Content-Type', 'text/csv');
        res.attachment('projects.csv');
        return res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getWorkloadStats,
    exportProjectsToCSV
};
