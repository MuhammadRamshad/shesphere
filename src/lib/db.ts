
import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // For browser-side code, we'll skip the connection
  if (typeof window !== 'undefined') {
    console.log('MongoDB connection skipped in browser environment');
    return;
  }

  // This code will only run on the server
  if (isConnected) {
    console.log('MongoDB connection already established');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shesphere';
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined');
    }
    
    await mongoose.connect(MONGODB_URI);
    
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Instead of throwing, we'll just log the error
    // This prevents the application from crashing in environments
    // where MongoDB is not available
  }
};

export default connectDB;
