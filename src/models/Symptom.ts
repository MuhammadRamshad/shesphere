
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

// Create a mock model for client-side or use the actual model for server-side
let Symptom: any;

// Check if we're in the browser
if (typeof window !== 'undefined') {
  // Create a mock model for client-side
  console.log('Using mock Symptom model for client-side rendering');
  Symptom = {
    find: () => ({ sort: () => ({ exec: () => [] }), exec: () => [] }),
    findOne: () => ({ exec: () => null }),
    create: (data: any) => Promise.resolve(data)
  };
} else {
  // Server-side: Use real Mongoose model
  try {
    // Check if the model is already defined
    Symptom = mongoose.models.Symptom || mongoose.model<ISymptom>('Symptom', SymptomSchema);
  } catch (error) {
    console.error('Error creating Symptom model:', error);
    // Fallback mock model
    Symptom = {
      find: () => ({ sort: () => ({ exec: () => [] }), exec: () => [] }),
      findOne: () => ({ exec: () => null }),
      create: (data: any) => Promise.resolve(data)
    };
  }
}

export default Symptom;
