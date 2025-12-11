const Comment = require('../models/Comment');

// @desc    Get comments for a project
// @route   GET /api/comments?projectId=xxx
// @access  Private
const getComments = async (req, res) => {
    const { projectId } = req.query;
    try {
        const comments = await Comment.find({ project: projectId })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
    const { project, content, mentions } = req.body;
    try {
        const comment = new Comment({
            project,
            user: req.user._id,
            content,
            mentions
        });
        const createdComment = await comment.save();
        const populatedComment = await Comment.findById(createdComment._id)
            .populate('user', 'name email avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (comment) {
            // Check if user owns the comment
            if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to delete this comment' });
            }
            await comment.deleteOne();
            res.json({ message: 'Comment removed' });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getComments,
    createComment,
    deleteComment
};
