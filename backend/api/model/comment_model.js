const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    type: {
        type: Number,
        default: 0, // 0 for main comment, 1 for reply
        allowNull: false,
    },
    comment: {
        type: String,
        require: true,
    },
    comment_by: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: "User",
    },
    topic: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: "Topic",
    },
    reply_on: {
        type: mongoose.Schema.ObjectId,
        allowNull: true,
        default: null,
        ref: "Comment",
    },
    grand_parent_comment: {
        type: mongoose.Schema.ObjectId,
        allowNull: true,
        default: null,
        ref: "Comment",
    },
    parent_comment: {
        type: mongoose.Schema.ObjectId,
        allowNull: true,
        default: null,
        ref: "Comment",
    },
    likes: [{
        type: mongoose.Schema.ObjectId, ref: "User"
    }],
    reports: [{
        user: { type: mongoose.Schema.ObjectId, ref: "User" },
        report: { type: mongoose.Schema.ObjectId, ref: "CommentReport" }
    }],
    replies: [{
        type: mongoose.Schema.ObjectId, ref: "User"
    }],
    seen: [{
        type: mongoose.Schema.ObjectId, ref: "User"
    }],
    //
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
    deleted: {
        type: Number,
        default: 0,
        allowNull: false,
    },
    deletedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Comment', CommentSchema);