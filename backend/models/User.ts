
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

export default mongoose.model<IUser>('User', UserSchema);
