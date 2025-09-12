
import mongoose, { Schema, Document } from 'mongoose';

export interface ISymptom extends Document {
  name: string;
  category: 'physical' | 'emotional' | 'other';
  description?: string;
  icon?: string;
}

const SymptomSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['physical', 'emotional', 'other'], required: true },
  description: { type: String },
  icon: { type: String }
}, { timestamps: true });

export default mongoose.model<ISymptom>('Symptom', SymptomSchema);
