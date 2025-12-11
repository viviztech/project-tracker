const Project = require('../models/Project');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ isArchived: false })
            .populate('owner', 'name email')
            .populate('members', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('members', 'name email');

        if (project) {
            res.json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin/PM)
const createProject = async (req, res) => {
    console.log('createProject called');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    const { name, description, status, priority, startDate, endDate, members, budget } = req.body;

    try {
        const project = new Project({
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            owner: req.user._id,
            members,
            budget
        });

        const createdProject = await project.save();
        console.log('Project created successfully:', createdProject);

        // Send email to members
        if (members && members.length > 0) {
            members.forEach(async (memberId) => {
                const user = await User.findById(memberId);
                if (user) {
                    const message = `You have been added to a new project: ${name}\n\nDescription: ${description}\nStart Date: ${startDate}\nEnd Date: ${endDate}`;
                    try {
                        await sendEmail({
                            to: user.email,
                            subject: 'New Project Invitation',
                            text: message
                        });
                    } catch (error) {
                        console.log('Email could not be sent to ' + user.email);
                    }
                }
            });
        }

        res.status(201).json(createdProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin/PM)
const updateProject = async (req, res) => {
    const { name, description, status, priority, startDate, endDate, members, budget } = req.body;

    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            // Calculate new members
            const oldMembers = project.members.map(m => m.toString());
            const newMembersList = members ? members.filter(m => !oldMembers.includes(m)) : [];

            project.name = name || project.name;
            project.description = description || project.description;
            project.status = status || project.status;
            project.priority = priority || project.priority;
            project.startDate = startDate || project.startDate;
            project.endDate = endDate || project.endDate;
            project.members = members || project.members;
            project.budget = budget || project.budget;

            const updatedProject = await project.save();

            // Send email to NEW members
            if (newMembersList.length > 0) {
                newMembersList.forEach(async (memberId) => {
                    const user = await User.findById(memberId);
                    if (user) {
                        const message = `You have been added to an existing project: ${updatedProject.name}\n\nDescription: ${updatedProject.description}`;
                        try {
                            await sendEmail({
                                to: user.email,
                                subject: 'Project Invitation',
                                text: message
                            });
                        } catch (error) {
                            console.log('Email could not be sent to ' + user.email);
                        }
                    }
                });
            }

            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            await project.deleteOne();
            res.json({ message: 'Project removed' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Archive a project
// @route   PUT /api/projects/:id/archive
// @access  Private (Admin only)
const archiveProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.isArchived = true;
        project.archivedAt = new Date();
        project.archivedBy = req.user._id;

        await project.save();
        res.json({ message: 'Project archived successfully', project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unarchive a project
// @route   PUT /api/projects/:id/unarchive
// @access  Private (Admin only)
const unarchiveProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.isArchived = false;
        project.archivedAt = null;
        project.archivedBy = null;

        await project.save();
        res.json({ message: 'Project restored successfully', project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get archived projects
// @route   GET /api/projects/archived
// @access  Private
const getArchivedProjects = async (req, res) => {
    try {
        const projects = await Project.find({ isArchived: true })
            .populate('owner', 'name email')
            .populate('members', 'name email')
            .populate('archivedBy', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    getArchivedProjects
};
