const User = require('../models/User');
const File = require('../models/File'); 
const Profile = require('../models/Profile');
const RatingAndReviews = require('../models/RatingAndReviews');
const cloudinary = require('cloudinary').v2;
var cron = require('node-cron');
const mailSender = require('../utils/mailSender');
const mediaUpload = require('../utils/mediaUpload');
require('dotenv').config();

exports.showProfile = async(req, res) => {
    try{
        const id = req.user.id;

        if(!id){
            return res.status(403).json({
                success: false,
                message: 'No id found'
            });
        }

        const user = await User.findById(id);

        const profile = await Profile.findById({_id: user.additionalDetails});

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            Profile: profile
        });
    }
    catch(error){
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in fetching a profile'
        });
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { gender, contactNumber = '', about = '', dateOfBirth = '' } = req.body;
        const id = req.user.id;

        if (!id || !gender) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(403).json({
                success: false,
                message: 'Invalid user id'
            });
        }

        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.contactNumber = contactNumber,
        profileDetails.gender = gender,
        profileDetails.dateOfBirth = dateOfBirth,
        profileDetails.about = about;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profileDetails
        });
    }
    catch (error) {
        return res.status(504).json({
            sucess: false,
            message: 'Error in updating a profile'
        });
    }
}

exports.updateDp = async(req, res) => {
    try{
        const id = req.user.id;
        const image = req.files.image;
    
        const user = await User.findById({_id: id});
        if(!user){
            return res.status(403).json({
                success: false,
                message: 'User not found'
            });
        }

        const response = await mediaUpload(image, process.env.FOLDER_NAME);
        console.log(response.secure_url);

        const updatedUser = await User.findByIdAndUpdate({_id: id}, 
        {
            image: response.secure_url
        }, {new: true});

        return res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            user: updatedUser
        });
    }
    catch(error){
        return res.status(504).json({
            success: false,
            message: 'Error in updating a dp'
        });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;

        const user = await User.findById({ _id: id });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'User not found'
            });
        }

        user.deletionScheduledAt = new Date(Date.now() + 5 * 60 * 60 * 24 * 1000);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account deletion scheduled after 5 days successfully'
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in scheduling deletion account task'
        });
    }
}

// The cron job will automatically call the function that finds users whose deletion time has passed and deletes them from the database
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running deletion account task');

        const now = new Date();

        // finding users which has deletionScheduledAt time(date) less than or equal to now if yes then we have to delete now as time has already passed
        const usersToDelete = await User.find({
            deletionScheduledAt: { $lte: now }
        });


        // iterating through each user and deleting all details
        for (const user of usersToDelete) {
            const email = user.email;
            await Profile.findByIdAndDelete(user.additionalDetails);

            if (user.uploadedFile && user.uploadedFile.length > 0) {
                for (const fileId of user.uploadedFile) {
                    const file = await File.findById(fileId);

                    if (file) {

                        await RatingAndReviews.deleteMany({ file: file._id });

                        await cloudinary.uploader.destroy(file.cloudinary_id);

                        await File.findByIdAndDelete(fileId);
                    }
                }
            }

            await RatingAndReviews.deleteMany({ user: user._id });

            await User.findByIdAndDelete(user._id);

            await mailSender(email, 'Successful Deletion Of Your ScholarConnect Account', 'Your ScholarConnect account has been deleted successfully');
        }

        console.log(`Deleted ${usersToDelete.length} user accounts.`);
        return res.status(200).json({
            success: true,
            message: 'Account deletion scheduled after 5 days successfully'
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in account deletion scheduled task'
        });
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
