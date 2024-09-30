const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    studentsDownloaded: {
        type: Number,
        default: 0,
        required: true
    },
    studentReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReviews'
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);