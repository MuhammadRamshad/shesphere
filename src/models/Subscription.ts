
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  productId: string;
  planType: 'basic' | 'standard' | 'premium';
  duration: number;
  price: number;
  nextDeliveryDate: Date;
  startDate: Date;
  endDate: Date;
  deliveriesCompleted: number;
  totalDeliveries: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  lastOrderDate?: Date;
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  productId: { type: String, required: true, ref: 'Product' },
  planType: { 
    type: String, 
    enum: ['basic', 'standard', 'premium'],
    required: true 
  },
  duration: { type: Number, required: true }, // in months
  price: { type: Number, required: true },
  nextDeliveryDate: { type: Date, required: true },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  deliveriesCompleted: { type: Number, required: true, default: 0 },
  totalDeliveries: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  paymentMethod: { type: String, required: true },
  lastOrderDate: { type: Date }
}, { timestamps: true });

// Check if the model already exists to prevent model overwrite errors
const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
