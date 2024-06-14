const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TopicSchema = Schema({
    requested_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    describe: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        default: 0, // 0--> Newest, 1--> Selected, 2--> Not Selected,
        allowNull: false,
    },
    modified: {
        type: Number,
        default: 0, // 0--> Not Modified, 1--> Modified, 2--> Modified By Admin,
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

module.exports = mongoose.model('Topic', TopicSchema);