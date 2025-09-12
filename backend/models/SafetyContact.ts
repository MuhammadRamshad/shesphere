
import mongoose, { Schema, Document } from 'mongoose';

export interface ISafetyContact extends Document {
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  isEmergencyContact: boolean;
}

const SafetyContactSchema: Schema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true  },
  isEmergencyContact: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ISafetyContact>('SafetyContact', SafetyContactSchema);
