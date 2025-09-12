
import mongoose, { Schema, Document } from 'mongoose';

// Creating a simpler interface for client-side usage
export interface ISafetyAlert {
  _id?: string;
  userId: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    lat?: number; // Added for compatibility
    lng?: number; // Added for compatibility
    address?: string;
  };
  alertType: 'emergency' | 'check-in' | 'test';
  status: 'active' | 'resolved' | 'false-alarm';
  contactsNotified: string[];
  notes?: string;
}

// The Mongoose document interface with Document type but omitting _id to avoid conflict
interface ISafetyAlertDocument extends Omit<ISafetyAlert, '_id'>, Document {}

const SafetyAlertSchema: Schema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },
  alertType: { type: String, enum: ['emergency', 'check-in', 'test'], required: true },
  status: { type: String, enum: ['active', 'resolved', 'false-alarm'], default: 'active' },
  contactsNotified: [{ type: String, ref: 'SafetyContact' }],
  notes: { type: String }
}, { timestamps: true });

// Check if the model already exists to prevent model overwrite errors
const SafetyAlert = mongoose.models.SafetyAlert || mongoose.model<ISafetyAlertDocument>('SafetyAlert', SafetyAlertSchema);

export default SafetyAlert;
