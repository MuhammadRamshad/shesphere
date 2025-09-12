import dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

// Load environment variables from .env
dotenv.config();

// ⛓️ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 🧩 Import your TS models
import SafetyAlert from './models/SafetyAlert';
import SafetyContact from './models/SafetyContact';

// 🚨 Main function
async function sendTestAlertEmail(): Promise<void> {
  try {
    // 1️⃣ Create dummy alert data with fields required by your model
    const dummyAlert = {
      userId: 'Tony Stark',
      notes: 'This is a test safety alert!',
      location: {
        latitude: 9.804707042178137,
        longitude: 76.45478723040775,
      },
      alertType: 'test' as 'test',
      status: 'active' as 'active',
      timestamp: new Date(),
      contactsNotified: [
        '6804baf61a9eec86b2ff265e', // Replace with actual SafetyContact IDs (as strings)
        '67fcb02d42675379dae55389',
      ],
    };

    // 2️⃣ Save alert to the database
    const newAlert = await SafetyAlert.create(dummyAlert);
    console.log('✅ Alert created:', newAlert._id);

    // 3️⃣ Fetch the contacts based on the provided IDs
    const contacts = await SafetyContact.find({
      _id: { $in: dummyAlert.contactsNotified },
    });

    if (!contacts.length) {
      console.warn('⚠️ No contacts found.');
      return;
    }

    // 4️⃣ Setup email transporter
    const ALERT_EMAIL = process.env.ALERT_EMAIL;
    const ALERT_EMAIL_PASSWORD = process.env.ALERT_EMAIL_PASSWORD;

    if (!ALERT_EMAIL || !ALERT_EMAIL_PASSWORD) {
      console.error('❌ Email credentials missing in .env');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ALERT_EMAIL,
        pass: ALERT_EMAIL_PASSWORD,
      },
    });

    await transporter.verify();
    console.log('✅ Transporter verified');

    // 5️⃣ Send email to each contact
    for (const contact of contacts) {
      if (contact.email) {
        const mailOptions = {
          from: `"Safety Alert" <${ALERT_EMAIL}>`,
          to: contact.email,
          subject: '🚨 Emergency Alert from Your Contact',
          html: `
            <h3>🚨 Emergency Alert Received</h3>
            <p><strong>Contact:</strong> ${dummyAlert.userId}</p>
            <p><strong>Notes:</strong> ${dummyAlert.notes}</p>
            <p>
              <strong>Location:</strong> 
              <a href="https://maps.google.com/?q=${dummyAlert.location.latitude},${dummyAlert.location.longitude}" target="_blank">
                View on Map
              </a>
            </p>
            <p>Sent on: ${new Date(dummyAlert.timestamp).toLocaleString()}</p>
          `,
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`📧 Email sent to ${contact.email}: ${info.response}`);
        } catch (err: any) {
          console.error(`❌ Failed to send to ${contact.email}:`, err.message);
        }
      }
    }

    console.log('✅ All emails processed');
  } catch (err: any) {
    console.error('❌ Error in test alert email:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

sendTestAlertEmail();
