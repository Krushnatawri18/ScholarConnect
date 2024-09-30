const RatingAndReviews = require('../models/RatingAndReviews');
const File = require('../models/File');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createRatings = async (req, res) => {
    try {
        const { fileId, rating, review } = req.body;
        const id = req.user.id;

        if (!fileId || !rating || !review || !id) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const file = await File.findById({ _id: fileId });
        if (!file) {
            return res.status(403).json({
                success: false,
                message: 'File not found'
            });
        }

        const userReviewed = await RatingAndReviews.findOne({
            user: id,
            file: fileId
        });
        if (userReviewed) {
            return res.status(403).json({
                success: false,
                message: 'User already reviewed'
            });
        }

        const newRatingAndReview = await RatingAndReviews.create({
            user: id,
            rating: rating,
            review: review,
            file: fileId
        });

        const updatedFile = await File.findByIdAndUpdate({ _id: fileId }, {
            $push: {
                studentReviews: newRatingAndReview._id
            }
        }, { new: true });

        const updatedUser = await User.findByIdAndUpdate({_id: id}, {
            $push: {
                review: newRatingAndReview._id
            }
        }, {new: true});
        console.log(updatedUser);

        return res.status(200).json({
            success: true,
            message: 'User reviewed successfully',
            file: updatedFile,
            user: updatedUser,
            ratings: newRatingAndReview
        });
    }
    catch (error) {
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in reviewing a file'
        });
    }
}

exports.getAllRatings = async (req, res) => {
    try {
        const allRatings = await RatingAndReviews.find({})
            .sort({rating: -1})
            .populate({
                path: 'user',
                select: 'firstName lastName image'
            })
            .populate('review')
            .exec();

        return res.status(200).json({
            success: true,
            message: 'All ratings fetched successfully',
            allRatings
        });
    }
    catch (error) {
    console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in fetching all ratings'
        });
    }
}

exports.getAllRatingsOfFile = async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            })
        }

        const file = await File.findById(fileId).populate('studentReviews').populate('uploadedBy').exec();
        if (!file) {
            return res.status(403).json({
                success: false,
                message: 'File not found'
            });
        }

        const ratingIds = file.studentReviews;
        console.log('Rating IDs:', ratingIds);
        const ratingDetails = await RatingAndReviews.find({
            _id: {
                $in: ratingIds
            }
        })
            .sort({ rating: -1})
            .populate({
                path: 'user',
                select: 'firstName lastName image'
            })
            .populate({
                path: 'file',
                select: 'title description'
            }).exec();

        return res.status(200).json({
            success: true,
            message: 'All ratings of file fetched successfully',
            ratingDetails
        });
    }
    catch (error) {
    console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in fetching all ratings of file'
        });
    }
}

exports.getAvgRatings = async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const file = await File.findById({ _id: fileId });
        if (!file) {
            return res.status(403).json({
                success: false,
                message: 'File not found'
            });
        }

        const result = await RatingAndReviews.aggregate([
            {
                $match: {
                    file: new mongoose.Schema.Types.ObjectId(fileId)
                }
            },
            {
                // groups all the documents into single group
                $group: {
                    // all documents that matched the previous stage are aggregated together to produce a single average rating
                    _id: null,
                    // stores average rating from all the ratings of specified file
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        // aggregation returns array which have single and only item averageRating as only one group
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Fetched average ratings',
                averageRating: result[0].averageRating
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fetched average ratings',
            averageRating: 0
        });
    }
    catch (error) {
    console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in fetching average ratings'
        });
    }
}
