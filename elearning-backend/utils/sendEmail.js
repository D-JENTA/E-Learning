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
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, otp) => {
    try {
        const rawHtml = loadTemplate();
        const finalHtml = fillOtp(rawHtml, otp);

        console.log(`Mengirim email ke: ${to}...`);

        const info = await transporter.sendMail({
            from: `"E-Learning" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Your OTP Code",
            html: finalHtml,
            attachments: [{
                filename: "eduLogo.png",
                path: path.join(__dirname, "../assets/eduLogo.png"),
                cid: "logo"
            }]
        });

        console.log("Email berhasil dikirim: ", info.messageId);
    } catch (error) {
        console.error("Gagal mengirim email detail:", error);
        throw error; 
    }
};

module.exports = sendEmail;

