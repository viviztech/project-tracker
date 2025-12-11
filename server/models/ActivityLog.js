const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        enum: ['Project', 'Task', 'Milestone', 'Document', 'Comment'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: String
    }
}, {
    timestamps: true
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
