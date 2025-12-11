const Milestone = require('../models/Milestone');

// @desc    Get milestones for a project
// @route   GET /api/milestones?projectId=xxx
// @access  Private
const getMilestones = async (req, res) => {
    const { projectId } = req.query;
    try {
        const milestones = await Milestone.find({ project: projectId }).sort({ order: 1 });
        res.json(milestones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a milestone
// @route   POST /api/milestones
// @access  Private
const createMilestone = async (req, res) => {
    const { name, description, project, dueDate, status, completionPercentage, order } = req.body;
    try {
        const milestone = new Milestone({
            name,
            description,
            project,
            dueDate,
            status,
            completionPercentage,
            order
        });
        const createdMilestone = await milestone.save();
        res.status(201).json(createdMilestone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a milestone
// @route   PUT /api/milestones/:id
// @access  Private
const updateMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.id);
        if (milestone) {
            Object.assign(milestone, req.body);
            const updatedMilestone = await milestone.save();
            res.json(updatedMilestone);
        } else {
            res.status(404).json({ message: 'Milestone not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a milestone
// @route   DELETE /api/milestones/:id
// @access  Private
const deleteMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.id);
        if (milestone) {
            await milestone.deleteOne();
            res.json({ message: 'Milestone removed' });
        } else {
            res.status(404).json({ message: 'Milestone not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone
};
