
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  productId: { type: String, required: true, ref: 'Product' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  content: { type: String, required: true },
  helpful: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
