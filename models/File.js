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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    tags: [{
        type: String,
        required: true
    }],
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
    ratingsAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReviews'
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now()
    }
});

exports.module = mongoose.model('File', fileSchema);