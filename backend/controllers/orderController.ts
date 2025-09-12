
import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import Product from '../models/Product';
import mongoose from 'mongoose';

export const createOrder = async (req: Request, res: Response) => {
  try {
    //console.log(" Incoming order payload:", req.body);
    const {
      userId,
      userName,
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      shippingAddress,
      paymentMethod
    } = req.body;

    // Loop through each product in the order to check stock and update
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }

      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // Build the correct orderData for the schema
    const orderData = {
      userId,
      userName,
      customerName,
      customerEmail,
      customerPhone,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending'
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Server error during order creation',
      message: (error as Error).message
    });
  }
};


// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Server error fetching orders',
      message: (error as Error).message 
    });
  }
};

// Get orders by user ID
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    console.log(`Fetching orders for user: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error(`Error fetching orders for user ${req.params.userId}:`, error);
    res.status(500).json({ 
      error: 'Server error fetching user orders',
      message: (error as Error).message 
    });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(`Error fetching order ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Server error fetching order',
      message: (error as Error).message 
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(`Error updating order ${req.params.id} status:`, error);
    res.status(500).json({ 
      error: 'Server error updating order status',
      message: (error as Error).message 
    });
  }
};
