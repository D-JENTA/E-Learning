const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, otp) => {
    await transporter.sendMail({
        from: `"E-Learning" <${process.env.EMAIL_USER}>`,
        to,
        subject: "your otp code",
        text: `your OTP code is ${otp}. This code Expires in 5 minutes`
    });
};

module.exports = sendEmail;

