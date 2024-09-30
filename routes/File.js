const express = require('express');
const router = express.Router();

const { createFile, getUploadedFileDetails, showAllUploadedFiles, updateStudentDownloads, deleteFile } = require('../controllers/File');

const {auth, isStudent, isAdmin} = require('../middlewares/auth');

const { createCategory, updateCategory, deleteCategory, showAllCategories } = require('../controllers/Category');
const { createRatings, getAllRatings, getAllRatingsOfFile, getAvgRatings } = require('../controllers/RatingAndReviews');

router.post('/createFile', auth, isStudent, createFile);
router.get('/getUploadedFileDetails', getUploadedFileDetails);
router.get('/getAllUploadedFiles', showAllUploadedFiles);
router.delete('/deleteFile', auth, deleteFile);
router.put('/updateStudentDownloads', updateStudentDownloads);

router.post('/createCategory', auth, isAdmin, createCategory);
router.put('/updateCategory', auth, isAdmin, updateCategory);
router.delete('/deleteCategory', auth, isAdmin, deleteCategory);
router.get('/showAllCategories', showAllCategories);

router.post('/createRatings', auth, isStudent, createRatings);
router.get('/getAllRatings', getAllRatings);
router.get('/getAllRatingsOfFile', getAllRatingsOfFile);
router.get('/getAvgRatings', getAvgRatings);

module.exports = router;