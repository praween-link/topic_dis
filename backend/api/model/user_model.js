const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    profile_image: {
        type: String,
        required: false,
        allowNull: true,
    },
    email: {
        type: String,
        required: true,
    },
    country_code: {
        type: String,
        allowNull: true,
        default: null,
    },
    phone_number: {
        type: String,
        allowNull: true,
        default: null,
    },
    phone_number_verify: {
        type: Number,
        default: 0,
        allowNull: false,
    },
    email_verify: {
        type: Number,
        required: true,
        default: 0,
        allowNull: false,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        allowNull: true,
    },
    login_type: { // Default: 0, Apple: 1, Google: 2, Facebook: 3
        type: Number,
        allowNull: false,
        default: 0
    },
    platform_type: { // Android: 0, Ios: 1, Web: 3
        type: Number,
        allowNull: false,
        default: 0
    },
    device_token: {
        type: String,
        allowNull: true,
    },
    status: {
        type: Number,
        default: 0, // 0- Active user, 1- Inactive user (by admin)
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
    address: {
        type: mongoose.Schema.ObjectId,
        ref: "UserAddress",
    }
});


module.exports = mongoose.model('User', UserSchema);