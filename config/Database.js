const mongoose = require('mongoose');
require('dotenv').config();

exports.connectWithDb = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Db connection successful'))
    .catch((error) => {
        console.error(error);
        console.log('Db connection unsuccessful');
        process.exit(1);
    });
}