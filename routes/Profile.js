const express = require('express');
const router = express.Router();

const { showProfile, updateProfile, updateDp, deleteAccount } = require('../controllers/Profile');
const { auth, isStudent } = require('../middlewares/auth');

router.get('/showProfile', auth, showProfile)
router.put('/updateProfile', auth, updateProfile);
router.put('/updateDp', auth, updateDp);
router.delete('/deleteAccount', auth, isStudent, deleteAccount);

module.exports = router;