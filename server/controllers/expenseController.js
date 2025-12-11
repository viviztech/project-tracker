const Expense = require('../models/Expense');

// @desc    Get expenses for a project
// @route   GET /api/expenses?projectId=...
// @access  Private
const getExpenses = async (req, res) => {
    const { projectId } = req.query;

    try {
        const query = projectId ? { project: projectId } : {};
        const expenses = await Expense.find(query)
            .populate('recordedBy', 'name email')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
    const { project, amount, description, category, date } = req.body;

    try {
        const expense = new Expense({
            project,
            amount,
            description,
            category,
            date,
            recordedBy: req.user._id
        });

        const createdExpense = await expense.save();
        res.status(201).json(createdExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (expense) {
            await expense.deleteOne();
            res.json({ message: 'Expense removed' });
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    deleteExpense
};
