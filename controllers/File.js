const File = require('../models/File');
const Category = require('../models/Category');
const User = require('../models/User');
const RatingAndReviews = require('../models/RatingAndReviews');
const isFileSupported = require('../utils/checkType');
const mediaUpload = require('../utils/mediaUpload');
require('dotenv').config();
const path = require('path');
const Cloudinary = require('cloudinary').v2;

exports.createFile = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;

        const file = req.files.file;
        const thumbnail = req.files.thumbnail;

        if (!title || !description || !category || !tags || !file || !thumbnail) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const id = req.user.id;

        const studentDetails = await User.findById(id);
        if (!studentDetails) {
            return res.status(403).json({
                success: false,
                message: 'User not found'
            });
        }

        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(403).json({
                success: false,
                message: 'Category not found'
            });
        }

        const fileSupportedTypes = ['pdf', 'docx', 'pptx'];
        const fileType = path.extname(file.name).toLowerCase().substring(1);

        if (!isFileSupported(fileType, fileSupportedTypes)) {
            return res.status(403).json({
                success: false,
                message: 'File type is not supported'
            });
        }

        const imageSupportedTypes = ['jpg', 'jpeg', 'png'];
        const thumbnailType = path.extname(thumbnail.name).toLowerCase().substring(1);
        console.log(thumbnailType);

        if (!isFileSupported(thumbnailType, imageSupportedTypes)) {
            return res.status(403).json({
                success: false,
                message: 'Image type is not supported'
            });
        }

        const response = await mediaUpload(file, process.env.FOLDER_NAME1);
        console.log(response);

        const thumbnailResponse = await mediaUpload(thumbnail, process.env.FOLDER_NAME2, 200, 200, 'image');

        const newFile = new File({
            title: req.body.title,
            description: req.body.description,
            thumbnailUrl: thumbnailResponse.secure_url,
            category: req.body.category, 
            tags: req.body.tags, 
            cloudinaryId: response.public_id,
            fileUrl: response.secure_url,
            format: response.format || fileType,
            size: response.bytes,
            uploadedBy: req.user.id, 
        });
        await newFile.save();

        const updatedUser = await User.findByIdAndUpdate({ _id: id }, {
                $push: {
                    uploadedFile: newFile._id
                }
        }, { new: true });

        const updatedCategory = await Category.findByIdAndUpdate({ _id: category }, {
                $push: {
                    files: newFile._id
                }
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            newFile,
            updatedUser,
            updatedCategory
        });
    }
    catch (error) {
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in uploading a file'
        });
    }
}

exports.showAllUploadedFiles = async (req, res) => {
    try {
        const allUploads = await File.find({}, {
            title: true,
            description: true,
            thumbnailUrl: true,
            cloudinaryId: true,
            fileUrl: true,
            format: true,
            size: true,
            category: true,
            tags: true,
            studentsDownladed: true,
            studentReviews: true,
            uploadedBy: true
        });

        return res.status(200).json({
            success: true,
            message: 'All uploads fetched successfully',
            allUploads
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in fetching all uploads'
        });
    }
}

exports.getUploadedFileDetails = async (req, res) => {
    try {
        const { fileId } = req.body;

        const fileInfo = await File.findById(fileId).populate('studentReviews').populate('uploadedBy').populate('category').exec();

        if (!fileInfo) {
            return res.status(403).json({
                success: false,
                message: 'Invalid file id'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'File upload details fetched successfully',
            data: {
                fileInfo
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in fetching file upload details'
        });
    }
}

exports.updateStudentDownloads = async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(403).json({
                success: false,
                message: 'File not found'
            });
        }

        const studentDownloadNumber = file.studentsDownloaded;
        const updatedFile = await File.findByIdAndUpdate({ _id: fileId }, {
            $push: {
                studentsDownloaded: studentDownloadNumber + 1
            }
        }, { new: true });


        return res.status(200).json({
            success: true,
            message: 'Student download number updated successfully',
            updatedFile
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in updating student downloads'
        });
    }
}

const extractPublicId = (url) => {
    // Example: https://res.cloudinary.com/dxxxx/image/upload/v123456789/scholarconnect/samplefile.docx
    const parts = url.split('/');
    const versionAndId = parts.slice(-2).join('/'); // Get the last 2 parts (version and public_id)
    const publicIdWithExtension = versionAndId.split('.').slice(0, -1).join('.'); // Remove the file extension
    return publicIdWithExtension; // scholarconnect/samplefile
};

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

        const filePublicId = extractPublicId(file.fileUrl);
        console.log(filePublicId);
        const cloudinaryResponse = await Cloudinary.uploader.destroy(filePublicId);
        console.log(cloudinaryResponse);
        // if(cloudinaryResponse.result !== 'ok'){
        //     return res.status(504).json({
        //         success: false,
        //         message: 'Error in deleting cloudinary file'
        //     });
        // }

        const thumbnailPublicId = extractPublicId(file.thumbnailUrl);
        console.log(thumbnailPublicId);
        const thumnailCloudinaryResponse = await Cloudinary.uploader.destroy(thumbnailPublicId);
        console.log(thumnailCloudinaryResponse);
        // if(thumnailCloudinaryResponse.result !== 'ok'){
        //     return res.status(504).json({
        //         success: false,
        //         message: 'Error in deleting cloudinary thumbnail file'
        //     });
        // }

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
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in deleting a file'
        });
    }
}