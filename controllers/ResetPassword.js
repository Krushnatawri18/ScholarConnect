const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mailSender = require('../utils/mailSender'); 

exports.sendResetPasswordLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Not registered user'
            });
        }

        const token = crypto.randomUUID();
        await User.findOneAndUpdate({ email: email }, { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 }, { new: true });

        const url = `http://localhost:3000/reset-password/${token}`;

        await mailSender(email, 'ScholarConnect - Reset Password Link', `Your reset password link is ${url}`);

        return res.status(200).json({
            success: true,
            message: 'Reset password link sent successfully',
            token: token
        });
    }
    catch (error) {
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in sending reset password link'
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: 'Password not match'
            });
        }

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Token is invalid'
            });
        }

        if (!(user.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: 'Token is expired'
            });
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(newPassword, 10);
        }
        catch (error) {
            return res.status(504).json({
                success: false,
                message: 'Error in hashing a password'
            });
        }

        const updatedUser = await User.findOneAndUpdate({ token: token }, 
        {
            password: hashedPassword
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Password resetted successfully',
            updatedUser
        });
    }
    catch (error) {
        console.log(error);
        return res.status(504).json({
            success: false,
            message: 'Error in resetting a password'
        });
    }
}