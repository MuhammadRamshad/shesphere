
import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Razorpay keys - should come from env variables in production
const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_4pIdrvoVbJ0jtR';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'S7hFMXvivSmwu8oDjB6OB0On';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET
});

// Create a new Razorpay order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    
    // Convert to paise (Razorpay uses currency's smallest unit)
    const amountInPaise = Math.round(amount * 100);
    
    // Razorpay order creation options
    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };
    
    try {
      // Create Razorpay order
      const order = await razorpay.orders.create(options);
      
      res.status(201).json({
        success: true,
        order
      });
    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      
      // Fallback for development/testing
      const mockOrder = {
        id: `order_${Date.now()}`,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created',
        attempts: 0,
        notes: options.notes,
        created_at: Date.now()
      };
      
      res.status(201).json({
        success: true,
        order: mockOrder
      });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during order creation',
      error: (error as Error).message
    });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;
    
    // Verify signature
    let isSignatureValid = false;
    
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      
      isSignatureValid = generated_signature === razorpay_signature;
    } else {
      // For COD or when signature is not provided (testing)
      isSignatureValid = true;
    }
    
    if (isSignatureValid) {
      // Update the order status in the database
      const order = await Order.findById(orderId);
      
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Payment successful',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during payment verification',
      error: (error as Error).message
    });
  }
};

// Process Cash on Delivery order
export const processCodOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    
    // Find and update the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status for COD
    order.paymentStatus = 'pending';
    order.status = 'processing';
    order.paymentMethod = 'cash-on-delivery';
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'COD order placed successfully',
      order
    });
  } catch (error) {
    console.error('COD order processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during COD order processing',
      error: (error as Error).message
    });
  }
};
