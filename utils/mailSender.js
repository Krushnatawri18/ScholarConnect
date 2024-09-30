const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, subject, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,  
            secure: false, 
            tls: {
                rejectUnauthorized: true,
                minVersion: "TLSv1.2"
            },
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            from: 'ScholarConnect || Krushna Tawri ',
            to: `${email}`,
            subject: `${subject}`,
            html: `${body}`,
        });
        console.log(info);
        return info;
    }
    catch(error){
        console.error(error);
        console.log('Error in sending the mail');
    }
}

module.exports = mailSender;