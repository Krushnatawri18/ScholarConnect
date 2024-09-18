const mongoose = require('mongoose');

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

async function sendVerificationLink(email, body){
    try{
        
    }
    catch(error){
        console.error(error);
        console.log('Error while sending verification link');
    }
}

module.exports = mongoose.model('OTP', otpSchema);