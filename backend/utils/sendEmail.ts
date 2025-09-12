// utils/sendEmail.ts
import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, message: string) => {
  try {
    if (!process.env.ALERT_EMAIL || !process.env.ALERT_EMAIL_PASSWORD) {
      throw new Error('Missing email credentials in environment variables');
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify the transporter connection
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');

    const mailOptions = {
      from: `"Safety Alert System" <${process.env.ALERT_EMAIL}>`, // Use ALERT_EMAIL to match auth
      to,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}:`, info.response);
  } catch (err) {
    console.error(`❌ Fail aayedaaaaa to send email to ${to}:`, err);
  }
};
