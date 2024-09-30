const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    accountType: {
        type: String,
        enum: ['Student', 'Admin'],
        required: true
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    token: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    deletionScheduledAt: {
        type: Date,
        default: null
    },
    uploadedFile: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    review: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RatingAndReviews'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);