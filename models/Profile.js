const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
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