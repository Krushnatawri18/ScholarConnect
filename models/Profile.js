const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    image: {
        type: String
    },
    gender: {
        type: String
    },
    about: {
        type: String
    },
    contactNumber: {
        type: Number
    },
    dateOfBirth: {
        type: Date
    }
});

module.exports = mongoose.model('Profile', profileSchema);