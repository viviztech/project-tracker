const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    impact: {
        type: String
    },
    mitigation: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Identified', 'Mitigating', 'Resolved', 'Accepted'],
        default: 'Identified'
    }
}, {
    timestamps: true
});

const Risk = mongoose.model('Risk', riskSchema);

module.exports = Risk;
