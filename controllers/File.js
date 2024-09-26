const File = require('../models/File');
const Category = require('../models/Category');
const User = require('../models/User');
const isFileSupported = require('../utils/checkType');
const mediaUpload = require('../utils/mediaUpload');
require('dotenv').config();

exports.createFile = async (req, res) => {
    try {
        const { title, description, category, tag } = req.body;

        const file = req.files.file;

        if (!title || !description || !category || !tag || !file) {
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

        const uploaderName = studentDetails.firstName + " " + studentDetails.lastName;

        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(403).json({
                success: false,
                message: 'Category not found'
            });
        }

        const supportedTypes = ['pdf', 'doc', 'ppt'];
        const fileType = file.name.split('.')[1].toLowerCase();
        if (!isFileSupported(fileType, supportedTypes)) {
            return res.status(403).json({
                success: false,
                message: 'File type is not supported'
            });
        }

        const response = await mediaUpload(file, process.env.FOLDER_NAME);
        console.log(response);

        const thumbnailResponse = await thumbnailUpload(file, process.env.FOLDER_NAME);
        console.log(thumbnailResponse);

        const newFile = await File.create({
            title: response.original_filename,
            description: description,
            fileUrl: response.secure_url,
            cloudinaryId: response.public_id,
            thumbnailUrl: thumbnailResponse.secure_url,
            format: response.format,
            size: response.bytes,
            category: categoryDetails._id,
            tags: response.tags,
            uploadedBy: uploaderName,
        });

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

        const fileInfo = await File.findById(fileId).populate('ratingsAndReviews').populate('uploadedBy').populate('category').exec();

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