const User = require('../models/User');
const Profile = require('../models/Profile');
const File = require('../models/File');
const RatingAndReviews = require('../models/RatingAndReviews');
const Cloudinary = require('cloudinary').v2;

exports.getAllUsers = async(req, res) => {
    try{
        const allUsers = await User.find({accountType: 'Student'});
        if(!allUsers){
            return res.status(403).json({
                success: false,
                message: 'Users not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'All users fetched successfully',
            users: allUsers
        });
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in fetching all users'
        });
    }
}

exports.deleteUser = async(req, res) => {
    try{
        const {userId} = req.body;
        if(!userId){
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const user = await User.findById({_id: userId});
        if(!user){
            return res.status(403).json({
                success: false,
                message: 'User not found'
            });
        }

        if(user.accountType === 'Admin'){
            return res.status(403).json({
                success: false,
                message: 'User is admin'
            });
        }

        await Profile.findByIdAndDelete({_id: user.additionalDetails});

        const associatedFiles = user.uploadedFile;
        if(associatedFiles.length > 0){
            await File.deleteMany({_id: {$in: associatedFiles}});
        }

        const associatedReviews = user.review;
        if(associatedReviews.length > 0){
            await RatingAndReviews.deleteMany({_id: {$in: associatedReviews}});
        }

        await User.findByIdAndDelete({_id: userId});

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in deleting a user'
        });
    }
}

exports.deleteFile = async(req, res) => {
    try{
        const {fileId} = req.body;
        if(!fileId){
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const file = await File.findById({_id: fileId});
        if(!file){
            return res.status(403).json({
                success: false,
                message: 'File not found'
            });
        }

        const cloudinaryResponse = await Cloudinary.uploader.destroy(file.cloudinaryId);
        console.log(cloudinaryResponse);
        if(cloudinaryResponse.result !== 'ok'){
            return res.status(504).json({
                success: false,
                message: 'Error in deleting cloudinary file'
            });
        }

        const updatedUser = await User.findByIdAndUpdate({_id: file.uploadedBy}, {
            $pull: {
                uploadedFile: fileId
            }
        }, {new: true});

        await Category.findByIdAndDelete({_id: file.category});

        const associatedReviews = file.studentReviews;
        if(associatedReviews.length > 0){
            await RatingAndReviews.deleteMany({_id: {$in: associatedReviews}});
        }

        file.uploadedBy = null;

        await File.findByIdAndDelete({_id: fileId});
        
        return res.status(200).json({
            success: true,
            message: 'File deleted successfully',
            user: updatedUser
        });
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in deleting a file'
        });
    }
}

exports.deleteReview = async(req, res) => {
    try{
        const {reviewId} = req.body;
        if(!reviewId){
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const review = await RatingAndReviews.findById({_id: reviewId});
        if(!review){
            return res.status(403).json({
                success: false,
                message: 'Review not found'
            });
        }

        const userReviewed = await User.findByIdAndUpdate({_id: review.user}, {
            $pull: {
                review: reviewId
            }
        }, {new: true});

        const fileReviewed = await File.findByIdAndUpdate({_id: review.file}, {
            $pull: {
                studentReviews: reviewId
            }
        }, {new: true});

        review.file = null;

        await review.save();

        return res.status(200).json({
            success: false,
            message: 'Review deleted successfully',
            user: userReviewed,
            file: fileReviewed
        });
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in deleting a review'
        });
    }
}