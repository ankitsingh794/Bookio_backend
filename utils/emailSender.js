const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    const mailOptions = {
      from: `"Bookio Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} with subject: "${subject}"`);
  } catch (error) {
    console.error(`Email sending failed to ${to} with subject "${subject}":`, error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
