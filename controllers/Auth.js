const bcrypt = require('bcrypt');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/OTP');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const mailSender = require('../utils/mailSender');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, otp, contactNumber } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !contactNumber) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: 'Already registered user'
            });
        }

        const response = await Otp.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(response);

        if (response.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'OTP not found'
            });
        }

        if (otp !== response[0].otp) {
            return res.status(403).json({
                success: false,
                message: 'OTP not match'
            });
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: 'Error in hashing a password'
            });
        }

        const profile = await Profile.create({
            gender: null,
            contactNumber: contactNumber,
            about: null,
            dateOfBirth: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            accountType,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            password: hashedPassword,
            additionalDetails: profile._id
        });

        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
            user,
            profile
        });
    }
    catch (error) {
        return res.status(504).json({
            success: true,
            message: 'Error in registering the user',
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not registered'
            });
        }

        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                id: user._id,
                accountType: user.accountType,
                email: user.email
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 60 * 60 + 1000),
                httpOnly: true
            };

            res.cookie('Token', token, options).status.json({
                success: true,
                message: 'User loggedin successfully',
                user,
                token,
            });
        }
        else {
            return res.status(403).json({
                success: false,
                message: 'Password is incorrect'
            });
        }
    }
    catch (error) {
        return res.statu(504).json({
            success: false,
            message: 'Error in login the user'
        });
    }
}

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const user = await User.findOne({ emai: email });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Not a registered user'
            });
        }

        let otp;
        let isUnique = false;

        do {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            const result = await Otp.findOne({ otp: otp });
            isUnique = !result;
        } while (!isUnique);

        const otpPayload = { email, otp };
        const newOtp = await Otp.create(otpPayload);

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            OTP: otp,
            newOtp
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in sending the otp'
        });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(403).json({
                success: false,
                message: 'Provide all the details'
            });
        }

        const user = await User.findById(req.user.id);

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(403).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        let newHashedPassword = await bcrypt.hash(newPassword, 10);

        const userDetails = await User.findByIdAndUpdate(req.user.id, {
            password: newHashedPassword
        }, { new: true });

        try {
            const response = await mailSender(userDetails.email, 'Password Change Request', `Password changed successfully for ${userDetails.firstName} ${userDetails.lastName}`);
            console.log('Mail sent successfully', response);
        }
        catch (error) {
            return res.status(504).json({
                success: false,
                message: 'Error in sending update mail'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password changed successfullly',
            userDetails
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: 'Error in upadting the password'
        });
    }
}