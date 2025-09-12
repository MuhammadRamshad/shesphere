
import mongoose, { Schema, Document } from 'mongoose';

// Creating a simpler interface for client-side usage
export interface ISafetyContact {
  _id?: string;
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  isEmergencyContact: boolean;
}

// The Mongoose document interface with Document type but omitting _id to avoid conflict
interface ISafetyContactDocument extends Omit<ISafetyContact, '_id'>, Document {}

const SafetyContactSchema: Schema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String,required: true  },
  isEmergencyContact: { type: Boolean, default: false }
}, { timestamps: true });

// Check if the model already exists to prevent model overwrite errors
const SafetyContact = mongoose.models.SafetyContact || mongoose.model<ISafetyContactDocument>('SafetyContact', SafetyContactSchema);

export default SafetyContact;
