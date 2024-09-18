const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60
    }
});

async function sendVerificationLink(email, otp){
    try{
        const emailBody = `Your verification otp is ${otp}`;
        const mailResponse = await mailSender(email, 'Verification mail from ScholarConnect', emailBody);
        console.log('Email sent successfully', mailResponse);
    }
    catch(error){
        console.error(error);
        console.log('Error while sending verification link');
    }
}

otpSchema.pre('save', async function(next){
    await sendVerificationLink(this.email, this.otp);
    next();
});

module.exports = mongoose.model('OTP', otpSchema);