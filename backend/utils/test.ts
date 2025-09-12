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

    const mailOptions = {
      from: `"Safety Alert" <${process.env.ALERT_EMAIL}>`,
      to: 'test@example.com', // replace with a test email
      subject: 'Test Email',
      text: 'This is a test email.',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.response);
  } catch (err) {
    console.error('❌ Email error:', err);
  }
}

testEmail();