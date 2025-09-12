// testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  if (!process.env.ALERT_EMAIL || !process.env.ALERT_EMAIL_PASSWORD) {
    console.error('Missing email credentials');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Transporter verified');
    console.log("Mail : ",process.env.ALERT_EMAIL);
    console.log("Pass : ",process.env.ALERT_EMAIL_PASSWORD);

    const mailOptions = {
      from: `"Safety Alert" <${process.env.ALERT_EMAIL}>`,
      to: 'muhammadramshad83162@gmail.com', // replace with a test email
      subject: 'Hi hi hi hi',
      text: 'This is a test email.',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.response);
  } catch (err) {
    console.error('❌ Email error:', err);
  }
}

testEmail();