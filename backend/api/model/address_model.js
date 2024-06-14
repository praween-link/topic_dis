const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserAddressSchema = new Schema({
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    status: {
        type: Number,
        default: 0,
        allowNull: false,
    },
});

module.exports = mongoose.model('UserAddress', UserAddressSchema);
