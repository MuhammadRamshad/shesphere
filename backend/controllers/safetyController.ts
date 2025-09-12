const path = require('path');
// Add more verbose logging about env file path
const envPath = path.resolve(__dirname, '../.env');
console.log("🔍 Loading .env from path:", envPath);
require('dotenv').config({ path: envPath });
const nodemailer = require('nodemailer');
import { Request, Response } from 'express';

import { SafetyContact, SafetyAlert, User } from '../models';

// Make these logs more visible with emojis
console.log("📧 ALERT_EMAIL:", process.env.ALERT_EMAIL);
console.log("🔐 ALERT_EMAIL_PASSWORD:", process.env.ALERT_EMAIL_PASSWORD ? "******" : "MISSING");

// Check if email credentials are available
if (!process.env.ALERT_EMAIL || !process.env.ALERT_EMAIL_PASSWORD) {
  console.error('❗ WARNING: Missing environment variables: ALERT_EMAIL or ALERT_EMAIL_PASSWORD');
  console.error('💡 Make sure your .env file contains these variables or set them directly in the environment');
}

// Define interfaces for your data models
interface ILocation {
  lat: number;
  lng: number;
}

interface ISafetyAlert {
  _id?: string;
  userId: string;
  timestamp: Date;
  location?: ILocation;
  alertType: "emergency" | "check-in" | "test";
  status: string;
  contactsNotified: string[];
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ISafetyContact {
  _id?: string;
  userId: string;
  name: string;
  phone: string;
  phoneNumber?: string;
  email: string,
  relationship: string;
  isPrimary?: boolean;
  isEmergencyContact?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateJoined?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

// Get safety contacts for a user
export const getSafetyContacts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const contacts = await SafetyContact.find({ userId });
    
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching safety contacts:', error);
    res.status(500).json({ error: 'Failed to fetch safety contacts' });
  }
};

// Create a new safety contact
export const createSafetyContact = async (req: Request, res: Response) => {
  try {
    const contactData = req.body;
    
    if (!contactData.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const contact = new SafetyContact(contactData);
    await contact.save();
    
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating safety contact:', error);
    res.status(500).json({ error: 'Failed to create safety contact' });
  }
};

// Delete a safety contact
export const deleteSafetyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const contact = await SafetyContact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error(`Error deleting safety contact ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete safety contact' });
  }
};

// Get safety alerts for a user
export const getSafetyAlerts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const alerts = await SafetyAlert.find({ userId }).sort({ timestamp: -1 });
    
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    res.status(500).json({ error: 'Failed to fetch safety alerts' });
  }
};



//create safety alert
export const createSafetyAlert = async (req: Request, res: Response): Promise<Response> => {
  console.log("🚨 createSafetyAlert controller triggered");
  console.log("⚠️ DEBUG: Code version April-21-2025");
  console.log("📧 EMAIL CREDENTIALS CHECK:");
  console.log("  - ALERT_EMAIL:", process.env.ALERT_EMAIL || "NOT SET");
  console.log("  - ALERT_EMAIL_PASSWORD:", process.env.ALERT_EMAIL_PASSWORD ? "IS SET" : "NOT SET");

  try {
    const { alert, sendEmail = true } = req.body;
    
    // Log email status
    if (sendEmail === true) {
      console.log("Email alerts are enabled — preparing to send.");
    }

    // Save alert to database
    const newAlert = await SafetyAlert.create(alert) as ISafetyAlert;
    console.log("✅ Alert saved to database:", newAlert._id?.toString() || "ID not available");

    // Check if newAlert has a valid _id
    if (!newAlert._id) {
      console.error("❌ Error: Created alert does not have a valid _id");
    }

    // Fetch emails of notified contacts with proper error handling
    let contacts: ISafetyContact[] = [];
    try {
      contacts = await SafetyContact.find({ _id: { $in: alert.contactsNotified } }) as ISafetyContact[];
      console.log(`✅ Found ${contacts.length} contacts to notify`);
    } catch (error) {
      const contactErr = error as Error;
      console.error("❌ Error fetching contacts:", contactErr.message);
      // Continue execution even if contact fetching fails
    }

    // Only attempt to send emails if sendEmail is true and we have contacts
    if (sendEmail && contacts.length > 0) {
      // Create transport with proper error handling
      try {
        // Define email credentials - use environment variables with fallback
        const emailUser = process.env.ALERT_EMAIL;
        const emailPass = process.env.ALERT_EMAIL_PASSWORD;
        
        console.log("🔍 DEBUG: Using email credentials:");
        console.log("  - Email:", emailUser || "MISSING!");
        console.log("  - Password:", emailPass ? "PROVIDED" : "MISSING!");
        
        // Check if environment variables are set
        if (!emailUser || !emailPass) {
          throw new Error("Missing email credentials in environment variables");
        }
        
        // Use more comprehensive configuration for better deliverability
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.ALERT_EMAIL,
            pass: process.env.ALERT_EMAIL_PASSWORD 
          },
          // Add DKIM support if you have configured it
          dkim: process.env.DKIM_PRIVATE_KEY ? {
            domainName: process.env.DKIM_DOMAIN || emailUser.split('@')[1],
            keySelector: process.env.DKIM_SELECTOR || 'default',
            privateKey: process.env.DKIM_PRIVATE_KEY
          } : undefined
        });
      
        // Verify the transporter connection
        console.log("🔍 DEBUG: Attempting to verify email transport connection...");
        try {
          await transporter.verify();
          console.log('✅ Email server connection verified');
        } catch (verifyError) {
          const verifyErr = verifyError as Error;
          console.error("❌ Email verification failed:", verifyErr.message);
          throw verifyError; // Re-throw to be caught by outer try/catch
        }
        
        // Fetch user info for the email
        let userName = "Unknown User";
        if (alert.userId) {
          try {
            console.log(`🔍 DEBUG: Looking up user with email: ${alert.userId}`);
            
            // Find the user by email instead of ID since alert.userId contains the email
            const user = await User.findOne({ email: alert.userId }) as IUser | null;
            
            if (user) {
              console.log("🔍 DEBUG: User data found:", JSON.stringify({
                hasName: !!user.name,
                hasEmail: !!user.email
              }));
              
              // Use full name if available
              if (user.name) {
                userName = `${user.name}`;
              } 
              else if (user.email) {
                userName = user.email;
              }
            } else {
              console.log("⚠️ User not found for email:", alert.userId);
              // If no user found by email, use the email as the username
              userName = alert.userId;
            }
            console.log(`✅ Using user info: ${userName}`);
          } catch (error) {
            const userErr = error as Error;
            console.error("❌ Error fetching user details:", userErr.message);
            // Use the email address as the username if lookup fails
            userName = alert.userId;
          }
        } else {
          console.log("⚠️ No userId (email) provided in the alert");
        }
        
        // Keep track of successful emails
        let successfulEmails = 0;
        
        // Send emails to each contact
        for (const contact of contacts) {
          if (contact.email) {
            console.log(`🔍 DEBUG: Preparing email to ${contact.email}`);
            
            // Create a unique message ID for better tracking
            const messageId = `<safety-alert-${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${emailUser.split('@')[1]}>`;
            
            // Get contact name if available
            const contactName = contact.name || contact.email.split('@')[0];
            
            // Create headers with proper type checking for newAlert._id
            const headers: Record<string, string> = {
              'X-Priority': '1',
              'X-MSMail-Priority': 'High',
              'Importance': 'High',
              'Precedence': 'urgent'
            };

            // Only add the alert ID to headers if it exists
            if (newAlert._id) {
              headers['X-Safety-Alert-ID'] = newAlert._id.toString();
            }
            
            const mailOptions = {
              from: {
                name: "Safety Alert System",
                address: emailUser
              },
              to: {
                name: contactName,
                address: contact.email
              },
              subject: "Important Safety Alert from " + userName,
              messageId: messageId,
              priority: 'high',
              headers: headers,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                  <h2 style="color: #d9534f;">Important Safety Alert</h2>
                  <p><strong>From:</strong> ${userName}</p>
                  <p><strong>Notes:</strong> ${alert.notes || "No additional details provided."}</p>
                  ${alert.location ? `<p><strong>Location:</strong> <a href="https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}" target="_blank" style="color: #0275d8;">View on Map</a></p>` : ""}
                  <p><strong>Sent on:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 0.9em; color: #777;">This is an automated safety alert. Please contact emergency services if appropriate.</p>
                  <p style="font-size: 0.8em; color: #999;">Please add ${emailUser} to your contacts to ensure you receive future safety alerts.</p>
                </div>
              `,
              text: `
                IMPORTANT SAFETY ALERT
                
                From: ${userName}
                Notes: ${alert.notes || "No additional details provided."}
                ${alert.location ? `Location: https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}` : ""}
                Sent on: ${new Date(alert.timestamp).toLocaleString()}
                
                This is an automated safety alert. Please contact emergency services if appropriate.
                Please add ${emailUser} to your contacts to ensure you receive future safety alerts.
              `
            };
    
            try {
              console.log(`🔍 DEBUG: Sending email to ${contact.email}...`);
              const info = await transporter.sendMail(mailOptions);
              console.log(`📧 Email alert sent to ${contact.email}: ${info.messageId}`);
              successfulEmails++;
            } catch (error) {
              const emailErr = error as Error;
              console.error(`❌ Failed to send email to ${contact.email}:`, emailErr.message);
              // Log more details about the error
              console.error("🔍 DEBUG: Email error details:", {
                errorName: emailErr.name,
                errorCode: (emailErr as any).code,
                errorCommand: (emailErr as any).command,
                stack: emailErr.stack
              });
              // Continue with other emails even if one fails
            }
          } else {
            console.log(`⚠️ Contact ${contact._id} has no email address`);
          }
        }
        
        console.log(`✅ Email sending complete. ${successfulEmails}/${contacts.length} emails sent successfully.`);
      } catch (error) {
        const emailSetupErr = error as Error;
        console.error("❌ Email setup failed:", emailSetupErr.message);
        console.error("🔍 DEBUG: Email setup error details:", {
          errorName: emailSetupErr.name,
          errorCode: (emailSetupErr as any).code,
          stack: emailSetupErr.stack
        });
        // Continue with response even if email sending fails
      }
    }
    
    // Return success response with the created alert
    return res.status(201).json({
      success: true,
      message: "Safety alert created successfully",
      data: newAlert
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error creating safety alert:", err.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to create alert",
      error: err.message
    });
  }
};