
import api from './api';
import { IOrder } from '@/types';

// Create a new order
export const createOrder = async (orderData: Partial<IOrder>): Promise<IOrder> => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<IOrder[]> => {
  try {
    console.log(`Fetching orders for user ID: ${userId}`);
    const response = await api.get(`/orders/user/${userId}`);
    console.log('Orders fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    
    // Fallback for demonstration
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          _id: 'mock-order-1',
          userId: userId,
          items: [
            {
              productId: 'product-1',
              name: 'Organic Cotton Pads',
              price: 8.99,
              quantity: 2
            },
            {
              productId: 'product-2',
              name: 'Menstrual Cup - Small',
              price: 24.99,
              quantity: 1
            }
          ],
          total: 42.97,
          status: 'delivered',
          shippingAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          paymentMethod: 'credit-card',
          paymentStatus: 'completed',
          trackingNumber: 'TRACK123456789',
          createdAt: new Date('2023-04-10T12:00:00'),
          updatedAt: new Date('2023-04-10T12:00:00')
        },
        {
          _id: 'mock-order-2',
          userId: userId,
          items: [
            {
              productId: 'product-3',
              name: 'Period Pain Relief Balm',
              price: 15.99,
              quantity: 1
            }
          ],
          total: 15.99,
          status: 'processing',
          shippingAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          paymentMethod: 'upi',
          paymentStatus: 'completed',
          createdAt: new Date('2023-05-15T14:30:00'),
          updatedAt: new Date('2023-05-15T14:30:00')
        },
        {
          _id: 'mock-order-3',
          userId: userId,
          items: [
            {
              productId: 'product-4',
              name: 'Reusable Period Underwear',
              price: 32.99,
              quantity: 1
            }
          ],
          total: 32.99,
          status: 'pending',
          shippingAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          paymentMethod: 'credit-card',
          paymentStatus: 'pending',
          createdAt: new Date('2023-06-01T09:15:00'),
          updatedAt: new Date('2023-06-01T09:15:00')
        },
        {
          _id: 'mock-order-4',
          userId: userId,
          items: [
            {
              productId: 'product-5',
              name: 'Cycle Tracking Journal',
              price: 19.99,
              quantity: 1
            }
          ],
          total: 19.99,
          status: 'shipped',
          shippingAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          paymentMethod: 'upi',
          paymentStatus: 'completed',
          trackingNumber: 'TRACK987654321',
          createdAt: new Date('2023-06-10T16:45:00'),
          updatedAt: new Date('2023-06-10T16:45:00')
        }
      ] as IOrder[];
    }
    
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<IOrder> => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<IOrder> => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

// Create a subscription order
export const createSubscription = async (subscriptionData: any): Promise<any> => {
  try {
    const response = await api.post('/api/subscriptions', subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get all subscriptions for a user
export const getUserSubscriptions = async (userId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/subscriptions/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (subscriptionId: string, status: string): Promise<any> => {
  try {
    const response = await api.patch(`/api/subscriptions/${subscriptionId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating subscription ${subscriptionId} status:`, error);
    throw error;
  }
};

// Default export
export default {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  createSubscription,
  getUserSubscriptions,
  updateSubscriptionStatus
};
