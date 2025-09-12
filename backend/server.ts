import path from 'path';
import { config } from 'dotenv';

// Load .env from the backend folder (one level up from dist/)
config({ path: path.resolve(__dirname, '../..', '.env') });

// Safe logging
console.log('Loaded Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('ALERT_EMAIL:', process.env.ALERT_EMAIL);
// Don't log the password


import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// MongoDB connection
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shesphere';
mongoose.connect(dbUri)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Import routes
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import periodDataRoutes from './routes/periodDataRoutes';
import resourceRoutes from './routes/resourceRoutes';
import reviewRoutes from './routes/reviewRoutes';
import safetyRoutes from './routes/safetyRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';

// Setup routes
app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/period-data', periodDataRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Shesphere Backend is running!');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
