const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get tasks (optionally filtered by project)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    const { projectId } = req.query;
    const filter = projectId ? { project: projectId } : {};

    try {
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email avatar')
            .populate('project', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { title, description, project, assignedTo, priority, status, dueDate, dependencies } = req.body;

    try {
        const task = new Task({
            title,
            description,
            project,
            assignedTo,
            priority,
            status,
            dueDate,
            dependencies
        });

        const createdTask = await task.save();

        // Send email to assigned user
        if (assignedTo) {
            const user = await User.findById(assignedTo);
            if (user) {
                const message = `You have been assigned a new task: ${title}\n\nDescription: ${description}\nDue Date: ${dueDate}`;
                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'New Task Assignment',
                        text: message
                    });
                } catch (error) {
                    console.log('Email could not be sent');
                }
            }
        }

        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { title, description, assignedTo, priority, status, dueDate, dependencies } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            const originalAssignee = task.assignedTo;

            task.title = title || task.title;
            task.description = description || task.description;
            task.assignedTo = assignedTo || task.assignedTo;
            task.priority = priority || task.priority;
            task.status = status || task.status;
            task.dueDate = dueDate || task.dueDate;
            task.dependencies = dependencies || task.dependencies;

            const updatedTask = await task.save();

            // Send email if assignee changed
            if (assignedTo && originalAssignee && assignedTo.toString() !== originalAssignee.toString()) {
                const user = await User.findById(assignedTo);
                if (user) {
                    const message = `You have been assigned to an existing task: ${updatedTask.title}\n\nDescription: ${updatedTask.description}\nDue Date: ${updatedTask.dueDate}`;
                    try {
                        await sendEmail({
                            to: user.email,
                            subject: 'Task Assignment Update',
                            text: message
                        });
                    } catch (error) {
                        console.log('Email could not be sent');
                    }
                }
            }

            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            await task.deleteOne();
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
