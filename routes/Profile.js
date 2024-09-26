const express = require('express');
const router = express.Router();

const { updateProfile, updateDp, deleteAccount } = require('../controllers/Profile');
const { auth, isStudent } = require('../middlewares/auth');

router.put('/updateProfile', updateProfile);
router.put('/updateDp', updateDp);
router.delete('/deleteAccount', auth, isStudent, deleteAccount);

module.exports = router;