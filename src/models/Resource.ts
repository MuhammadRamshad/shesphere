
import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  _id: string;
  title: string;
  description: string;
  category: 'health' | 'safety' | 'wellness' | 'mental';
  type: 'video' | 'article' | 'tip';
  videoUrl?: string;
  thumbnailUrl?: string;
  content?: string;
}

const ResourceSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['health', 'safety', 'wellness', 'mental'], required: true },
  type: { type: String, enum: ['video', 'article', 'tip'], required: true },
  videoUrl: { type: String },
  thumbnailUrl: { type: String },
  content: { type: String }
}, { timestamps: true });

// Create a mock model for client-side or use the actual model for server-side
let Resource: any;

// Check if we're in the browser
if (typeof window !== 'undefined') {
  // Create a mock model for client-side
  console.log('Using mock Resource model for client-side rendering');
  Resource = {
    find: () => ({ sort: () => ({ exec: () => [] }), exec: () => [] }),
    findOne: () => ({ exec: () => null }),
    create: (data: any) => Promise.resolve(data)
  };
} else {
  // Server-side: Use real Mongoose model
  try {
    // Check if the model is already defined
    Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
  } catch (error) {
    console.error('Error creating Resource model:', error);
    // Fallback mock model
    Resource = {
      find: () => ({ sort: () => ({ exec: () => [] }), exec: () => [] }),
      findOne: () => ({ exec: () => null }),
      create: (data: any) => Promise.resolve(data)
    };
  }
}

export default Resource;
