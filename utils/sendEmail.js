const nodemailer = require("nodemailer");
const path = require("path")
const fs = require("fs");

const loadTemplate = () => {
    const filePath = path.join(__dirname, "../templates/otpLayout.html")
    return fs.readFileSync(filePath, "utf8")
};

const fillOtp = (html, otp) => {
    return html.replaceAll("{{OTP}}",otp)
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, otp) => {
    const rawHtml = loadTemplate()
    const finalHtml = fillOtp(rawHtml, otp)
 
    await transporter.sendMail({
        from: `"E-Learning" <${process.env.EMAIL_USER}>`,
        to,
        subject: "your otp code",
        html : finalHtml,
        attachments : [{
            filename : "logo_png",
            path : path.join(__dirname, "../assets/eduLogo.png"),
            cid : "logo"
        }]
    });
};

module.exports = sendEmail;

