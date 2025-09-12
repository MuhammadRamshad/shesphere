
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  dateJoined: Date;
  lastLogin?: Date;
  bio?: string;
  avatarUrl?: string;
  preferences?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  };
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String },
  dateJoined: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  bio: { type: String },
  avatarUrl: { type: String },
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Modified model creation to handle both browser and server environments
let User: mongoose.Model<IUser>;

if (isBrowser) {
  // In browser, just create a mock model or placeholder
  const mockModel: any = { 
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    findByIdAndUpdate: () => Promise.resolve(null)
  };
  User = mockModel;
} else {
  // In Node.js environment, use the actual mongoose model
  try {
    // Try to get the existing model
    User = mongoose.model<IUser>('User');
  } catch {
    // If the model doesn't exist yet, create it
    User = mongoose.model<IUser>('User', UserSchema);
  }
}

export default User;
