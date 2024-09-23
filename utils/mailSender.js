const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, subject, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST_NAME,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = transporter.sendMail({
            from: 'ScholarConnect || Krushna Tawri <' + process.env.MAIL_USER + '>',
            email: `${email}`,
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