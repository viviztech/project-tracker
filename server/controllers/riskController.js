const Risk = require('../models/Risk');

// @desc    Get risks for a project
// @route   GET /api/risks?projectId=xxx
// @access  Private
const getRisks = async (req, res) => {
    const { projectId } = req.query;
    try {
        const risks = await Risk.find({ project: projectId })
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.json(risks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a risk
// @route   POST /api/risks
// @access  Private
const createRisk = async (req, res) => {
    const { project, description, severity, impact, mitigation, owner, status } = req.body;
    try {
        const risk = new Risk({
            project,
            description,
            severity,
            impact,
            mitigation,
            owner,
            status
        });
        const createdRisk = await risk.save();
        const populatedRisk = await Risk.findById(createdRisk._id).populate('owner', 'name email');
        res.status(201).json(populatedRisk);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a risk
// @route   PUT /api/risks/:id
// @access  Private
const updateRisk = async (req, res) => {
    try {
        const risk = await Risk.findById(req.params.id);
        if (risk) {
            Object.assign(risk, req.body);
            const updatedRisk = await risk.save();
            const populatedRisk = await Risk.findById(updatedRisk._id).populate('owner', 'name email');
            res.json(populatedRisk);
        } else {
            res.status(404).json({ message: 'Risk not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a risk
// @route   DELETE /api/risks/:id
// @access  Private
const deleteRisk = async (req, res) => {
    try {
        const risk = await Risk.findById(req.params.id);
        if (risk) {
            await risk.deleteOne();
            res.json({ message: 'Risk removed' });
        } else {
            res.status(404).json({ message: 'Risk not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRisks,
    createRisk,
    updateRisk,
    deleteRisk
};
