const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { projectId } = req.body;
        const originalName = req.file.originalname;

        // Check if document exists
        let document = await Document.findOne({ project: projectId, originalName: originalName });

        if (document) {
            // Add current file to versions history
            document.versions.push({
                path: document.path,
                size: document.size,
                uploadedBy: document.uploadedBy,
                createdAt: document.updatedAt
            });

            // Update with new file info
            document.path = req.file.path;
            document.size = req.file.size;
            document.mimeType = req.file.mimetype;
            document.uploadedBy = req.user._id;
            document.version = (document.version || 1) + 1;

            await document.save();
            res.status(200).json(document);
        } else {
            // Create new document
            document = new Document({
                name: req.body.name || originalName,
                originalName: originalName,
                path: req.file.path,
                mimeType: req.file.mimetype,
                size: req.file.size,
                project: projectId,
                uploadedBy: req.user._id,
                version: 1,
                versions: []
            });

            const createdDocument = await document.save();
            res.status(201).json(createdDocument);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get documents for a project
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
    const { projectId } = req.query;
    try {
        const documents = await Document.find({ project: projectId })
            .populate('uploadedBy', 'name');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (document) {
            // Delete file from filesystem
            if (fs.existsSync(document.path)) {
                fs.unlinkSync(document.path);
            }

            await document.deleteOne();
            res.json({ message: 'Document removed' });
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument
};
