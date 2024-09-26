const express = require('express');
const fileUpload = require('express-fileupload');
const connectWithDb = require('./config/Database');
const cloudinaryConnect = require('./config/Cloudinary');
require('dotenv').config();

const profileRoutes = require('./routes/Profile');
const fileRoutes = require('./routes/File');
const userRoutes = require('./routes/User');
const adminRoutes = require('./routes/Admin');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(fileUpload({
    useTempFiles: true, 
    tempFileDir: '/tmp/', 
}));
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/file', fileRoutes);
app.use('/api/v1/user', userRoutes); 
app.use('/api/v1/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`App started at port ${PORT}`);
});

app.get('/', (req, res)=> {
    res.send('Home Page');
});

cloudinaryConnect();
connectWithDb();