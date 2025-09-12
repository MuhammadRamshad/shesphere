
import mongoose, { Schema, Document } from 'mongoose';

export interface ISafetyAlert extends Document {
  userId: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  alertType: 'emergency' | 'check-in' | 'test';
  status: 'active' | 'resolved' | 'false-alarm';
  contactsNotified: string[];
  notes?: string;
}

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

export default mongoose.model<ISafetyAlert>('SafetyAlert', SafetyAlertSchema);
