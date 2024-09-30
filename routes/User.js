const express = require('express');
const router = express.Router();

const { signup, login, sendOtp, changePassword } = require('../controllers/Auth');
const {auth} = require('../middlewares/auth');
const { sendResetPasswordLink, resetPassword } = require('../controllers/ResetPassword');

router.post('/signup', signup);
router.post('/login', login);
router.post('/sendOtp', sendOtp);
router.post('/changePassword', auth, changePassword);
router.post('/reset-password-token', sendResetPasswordLink);
router.post('/resetPassword', resetPassword);

module.exports = router;