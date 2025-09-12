import api from './api';

// Razorpay payment response interface
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Payment interface
export interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

// Razorpay service
export const razorpayService = {
  // Create order for payment
  createOrder: async (paymentDetails: PaymentDetails): Promise<any> => {
    try {
      const response = await api.post('/payments/create-order', paymentDetails);
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  },

  // Verify payment after success
  verifyPayment: async (paymentData: RazorpayResponse, orderId: string): Promise<any> => {
    try {
      const response = await api.post('/payments/verify', {
        ...paymentData,
        orderId
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
  
  // Process COD order
  processCodOrder: async (orderId: string): Promise<any> => {
    try {
      const response = await api.post('/payments/cod', { orderId });
      return response.data;
    } catch (error) {
      console.error('Error processing COD order:', error);
      throw error;
    }
  },

  // Load Razorpay script dynamically
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }
      
      console.log('Loading Razorpay script...');
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      
      if (existingScript) {
        console.log('Razorpay script tag already exists');
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  },

  // Initialize Razorpay payment
  initializePayment: (options: any, onSuccess: (response: RazorpayResponse) => void, onError: (error: any) => void): void => {
    try {
      if (typeof window.Razorpay === 'undefined') {
        console.error('Razorpay SDK is not loaded');
        onError(new Error('Razorpay SDK not loaded'));
        return;
      }
      
      console.log('Creating Razorpay instance with options:', options);
      
      // Create a new instance with proper error handling
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        onError(response.error);
      });
      
      // Handle payment success separately from opening
      rzp.on('payment.success', function(response: RazorpayResponse) {
        console.log('Payment success event triggered:', response);
        onSuccess(response);
      });
      
      // Open the checkout modal
      console.log('Opening Razorpay checkout modal');
      rzp.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      onError(error);
    }
  }
};

// Add Razorpay type definition
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default razorpayService;