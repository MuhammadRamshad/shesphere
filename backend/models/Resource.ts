
import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
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

export default mongoose.model<IResource>('Resource', ResourceSchema);
