const express = require('express');
const fileUpload = require('express-fileupload');
const connectWithDb = require('./config/Database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(fileUpload({
    useTempFiles: true, 
    tempFileDir: '/tmp/', 
}));

app.listen(PORT, () => {
    console.log(`App started at port ${PORT}`);
});

app.get('/', (req, res)=> {
    res.send('Home Page');
});

connectWithDb();