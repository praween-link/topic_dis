const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentReportSchema = Schema({
    report_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
        required: true,
    },
    comment: {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
    },
    status: {
        type: Number,
        default: 0,
        allowNull: false,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    deletedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('CommentReport', CommentReportSchema);