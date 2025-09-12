
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string[];
  stockQuantity: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  imageUrl: { type: String, required: true },
  category: [{ type: String, required: true }],
  stockQuantity: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
