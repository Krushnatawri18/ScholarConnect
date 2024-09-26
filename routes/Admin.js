const express = require('express');
const router = express.Router();

const { getAllUsers, deleteFile, deleteReview, deleteUser } = require('../controllers/Admin');
const {auth, isAdmin} = require('../middlewares/auth');

router.get('/getAllUsers', auth, isAdmin, getAllUsers);
router.delete('/deleteUser', auth, isAdmin, deleteUser);
router.delete('/deleteFile', auth, isAdmin, deleteFile);
router.delete('/deleteReview', auth, isAdmin, deleteReview);

module.exports = router;