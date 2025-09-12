
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, ShoppingBag, Truck, Shield, Check, AlertCircle, IndianRupee, Banknote } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from '@/services/api';
import { authService } from "@/services/authService";
import razorpayService, { RazorpayResponse } from '@/services/razorpayService';
import orderService from '@/services/orderService';

// Validation schema for UPI payment
const upiSchema = z.object({
  upiId: z.string()
    .min(5, "UPI ID must be at least 5 characters")
    .regex(/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/, "Invalid UPI ID format")
});

// Validation schema for credit card
const creditCardSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number must not exceed 19 digits"),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format"),
  cvv: z.string()
    .regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits"),
  nameOnCard: z.string().min(3, "Name must be at least 3 characters")
});

// Shipping information schema
const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(6, "ZIP code is required")
});

const Checkout = () => {
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "upi" | "cod">("credit-card");
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { totalPrice, items, clearCart } = useCart();
  const user = authService.getCurrentUser();
  const userId = user?._id || '';
  const userName = user?.name || '';  
  //console.log(userName);
  // Form handling for shipping
  const shippingForm = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  // Form handling for credit card
  const creditCardForm = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: ""
    }
  });

  // Form handling for UPI
  const upiForm = useForm<z.infer<typeof upiSchema>>({
    resolver: zodResolver(upiSchema),
    defaultValues: {
      upiId: ""
    }
  });
  
  // Add this function at the component level, before the return statement
const debugRazorpay = () => {
  console.log('Window Razorpay object:', window.Razorpay);
  if (!window.Razorpay) {
    console.error('Razorpay is not defined in window object');
  }
};

// Then modify your existing useEffect hook
useEffect(() => {
  // Load Razorpay script when component mounts
  razorpayService.loadRazorpayScript().then(isLoaded => {
    if (!isLoaded) {
      console.warn("Razorpay script failed to load");
    } else {
      setTimeout(debugRazorpay, 1000); // Debug after 1 second
    }
  });
}, []);
  
  if (items.length === 0 && step !== "confirmation") {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-she-dark mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
          <Button asChild className="bg-she-purple hover:bg-she-indigo text-white">
            <Link to="/shop">
              <ShoppingBag size={16} className="mr-2" />
              Go Shopping
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const subtotal = totalPrice;
  const shipping = 99;
  const tax = subtotal * 0.18; // GST in India is typically 18%
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (data: z.infer<typeof shippingSchema>) => {
    console.log("Shipping data:", data);
    setStep("payment");
  };

 // In your Checkout.tsx file, modify the initializeRazorpay function
 const initializeRazorpay = async () => {
  setIsProcessingPayment(true);
  
  try {
    console.log('Starting Razorpay initialization process');
    
    // Ensure Razorpay script is loaded
    const isLoaded = await razorpayService.loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay script');
    }
    
    console.log('Razorpay script loaded, preparing order data');
    
    // Create order data
    const shippingAddress = {
      street: shippingForm.getValues().address + 
             (shippingForm.getValues().addressLine2 ? 
             ', ' + shippingForm.getValues().addressLine2 : ''),
      city: shippingForm.getValues().city,
      state: shippingForm.getValues().state,
      zipCode: shippingForm.getValues().zipCode,
      country: 'India'
    };
    
    const orderData = {
      userId,
      userName,
      customerName: shippingForm.getValues().firstName + ' ' + shippingForm.getValues().lastName,
      customerEmail: shippingForm.getValues().email,
      customerPhone: shippingForm.getValues().phone,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: total,
      status: 'pending',
      shippingAddress,
      paymentMethod: paymentMethod,
      paymentStatus: 'pending'
    };
    
    console.log('Creating order with data:', orderData);
    
    // Create the order
    const orderResponse = await api.post('/orders', orderData);
    const order = orderResponse.data;
    console.log('Order created:', order);

    // Create Razorpay order
    const paymentDetails = {
      orderId: order._id,
      amount: total,
      currency: 'INR',
      receipt: order._id
    };
    
    console.log('Creating Razorpay order with details:', paymentDetails);
    
    const razorpayOrderResponse = await razorpayService.createOrder(paymentDetails);
    console.log('Razorpay order created:', razorpayOrderResponse);
    
    if (!razorpayOrderResponse || !razorpayOrderResponse.order || !razorpayOrderResponse.order.id) {
      console.error('Invalid Razorpay order response:', razorpayOrderResponse);
      throw new Error('Failed to create Razorpay order');
    }
    
    // Configure Razorpay checkout options
    const options = {
      key: 'rzp_test_4pIdrvoVbJ0jtR', // Replace with your actual test key
      amount: razorpayOrderResponse.order.amount,
      currency: razorpayOrderResponse.order.currency,
      name: 'Shesphere',
      description: 'Purchase from Shesphere',
      order_id: razorpayOrderResponse.order.id,
      prefill: {
        name: shippingForm.getValues().firstName + ' ' + shippingForm.getValues().lastName,
        email: shippingForm.getValues().email,
        contact: shippingForm.getValues().phone
      },
      theme: {
        color: '#6849d3' // she-purple color
      },
      handler: function(response: RazorpayResponse) {
        console.log('Payment successful, handling response:', response);
        handlePaymentSuccess(response, order._id);
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          setIsProcessingPayment(false);
        }
      }
    };
    
    console.log('Initializing Razorpay payment with options:', options);
    
    // Initialize payment
    razorpayService.initializePayment(
      options,
      (response: RazorpayResponse) => handlePaymentSuccess(response, order._id),
      (error: any) => handlePaymentError(error)
    );
  } catch (error) {
    console.error('Payment initialization error:', error);
    toast({
      title: "Payment Error",
      description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
      variant: "destructive"
    });
    setIsProcessingPayment(false);
  }
};
  
  const handlePaymentSuccess = async (response: RazorpayResponse, orderId: string) => {
    try {
      // Verify the payment with the server
      await razorpayService.verifyPayment(response, orderId);
      
      // Clear the cart
      clearCart();
      
      // Show toast
      toast({
        title: "Payment successful!",
        description: "Your order has been placed",
      });
      
      // Set step to confirmation
      setStep("confirmation");
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Your payment was received but could not be verified. Our team will contact you.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: "Your payment was not completed. Please try again.",
      variant: "destructive"
    });
    setIsProcessingPayment(false);
  };
  
  const handleCodOrder = async () => {
    setIsProcessingPayment(true);
    try {
      // Create shipping address from form data
      const shippingAddress = {
        street: shippingForm.getValues().address + 
               (shippingForm.getValues().addressLine2 ? 
               ', ' + shippingForm.getValues().addressLine2 : ''),
        city: shippingForm.getValues().city,
        state: shippingForm.getValues().state,
        zipCode: shippingForm.getValues().zipCode,
        country: 'India'
      };
      
      // Create a new order in the database
      const orderData = {
        userId,
        userName,
        customerName: shippingForm.getValues().firstName + ' ' + shippingForm.getValues().lastName,
        customerEmail: shippingForm.getValues().email,
        customerPhone: shippingForm.getValues().phone,
        items: items.map(item => ({
          productId: item.id,
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
      
      
      // Create the order on the server
      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;
      
      // Process COD order
      await razorpayService.processCodOrder(order._id);
      
      // Clear the cart after successful order creation
      clearCart();
      
      // Show toast
      toast({
        title: "Order Placed!",
        description: "Your Cash on Delivery order has been placed",
      });
      
      // Set step to confirmation
      setStep("confirmation");
    } catch (error) {
      console.error('COD order processing error:', error);
      toast({
        title: "Order Processing Failed",
        description: "Failed to process your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Replace the handlePaymentSubmit function with this one
  const handlePaymentSubmit = async () => {
    let isValid = false;
    
    if (paymentMethod === "credit-card") {
      isValid = await creditCardForm.trigger();
      if (!isValid) return;
      
      // Use Razorpay for credit card payment
      initializeRazorpay();
    } else if (paymentMethod === "upi") {
      isValid = await upiForm.trigger();
      if (!isValid) return;
      
      // Use Razorpay for UPI payment
      initializeRazorpay();
    } else if (paymentMethod === "cod") {
      // Process Cash on Delivery order
      handleCodOrder();
    }
  };
  
  const renderCartSummary = () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
            <div className="flex-grow">
              <p className="font-medium text-she-dark">{item.name}</p>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Qty: {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <div className="border-t border-gray-100 pt-4 px-6">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
          <span>Total</span>
          <span className="text-she-purple">₹{total.toFixed(2)}</span>
        </div>
      </div>
      <CardFooter className="border-t border-gray-100 pt-4 flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Truck size={14} />
          <span>Free shipping on orders over ₹2500</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield size={14} />
          <span>30-day money-back guarantee</span>
        </div>
        {step === "shipping" && (
          <Link to="/shop" className="text-she-purple hover:text-she-indigo text-sm mt-2">
            Continue Shopping
          </Link>
        )}
      </CardFooter>
    </Card>
  );
  
  const renderShippingStep = () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
        <CardDescription>Enter your shipping details</CardDescription>
      </CardHeader>
      <Form {...shippingForm}>
        <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={shippingForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input className="border-she-lavender focus:border-she-purple" placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input className="border-she-lavender focus:border-she-purple" placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={shippingForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input className="border-she-lavender focus:border-she-purple" placeholder="jane.doe@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={shippingForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input className="border-she-lavender focus:border-she-purple" placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={shippingForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input className="border-she-lavender focus:border-she-purple mb-2" placeholder="Street Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={shippingForm.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input className="border-she-lavender focus:border-she-purple" placeholder="Apt, Suite, etc. (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={shippingForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input className="border-she-lavender focus:border-she-purple" placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input className="border-she-lavender focus:border-she-purple" placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingForm.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input className="border-she-lavender focus:border-she-purple" placeholder="ZIP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-gray-100 pt-4">
            <Button type="submit" className="bg-she-purple hover:bg-she-indigo text-white">
              Continue to Payment
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
  
  const renderPaymentStep = () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>Secure payment processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as "credit-card" | "upi" | "cod")}
          className="space-y-4"
        >
          <div className="glass-card p-4 rounded-lg bg-white/60">
            <div className="flex items-center mb-3">
              <RadioGroupItem value="credit-card" id="credit-card" className="text-she-purple" />
              <Label htmlFor="credit-card" className="ml-2 font-medium text-she-dark flex items-center">
                <CreditCard size={16} className="mr-2" />
                Credit or Debit Card
              </Label>
            </div>
            
            {paymentMethod === "credit-card" && (
              <Form {...creditCardForm}>
                <div className="space-y-4 mt-2">
                  <FormField
                    control={creditCardForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input className="border-she-lavender focus:border-she-purple" placeholder="1234 5678 9012 3456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={creditCardForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input className="border-she-lavender focus:border-she-purple" placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={creditCardForm.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Code</FormLabel>
                          <FormControl>
                            <Input className="border-she-lavender focus:border-she-purple" placeholder="CVC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={creditCardForm.control}
                    name="nameOnCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input className="border-she-lavender focus:border-she-purple" placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            )}
          </div>
          
          <div className="glass-card p-4 rounded-lg bg-white/60">
            <div className="flex items-center mb-3">
              <RadioGroupItem value="upi" id="upi" className="text-she-purple" />
              <Label htmlFor="upi" className="ml-2 font-medium text-she-dark flex items-center">
                <IndianRupee size={16} className="mr-2" />
                UPI Payment
              </Label>
            </div>
            
            {paymentMethod === "upi" && (
              <Form {...upiForm}>
                <div className="space-y-4 mt-2">
                  <FormField
                    control={upiForm.control}
                    name="upiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID</FormLabel>
                        <FormControl>
                          <Input 
                            className="border-she-lavender focus:border-she-purple" 
                            placeholder="username@bank" 
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your UPI ID in the format name@bank (e.g., jane@okaxis)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <p>You will receive a payment request notification on your UPI app.</p>
                  </div>
                </div>
              </Form>
            )}
          </div>
          
          <div className="glass-card p-4 rounded-lg bg-white/60">
            <div className="flex items-center mb-3">
              <RadioGroupItem value="cod" id="cod" className="text-she-purple" />
              <Label htmlFor="cod" className="ml-2 font-medium text-she-dark flex items-center">
                <Banknote size={16} className="mr-2" />
                Cash on Delivery
              </Label>
            </div>
            
            {paymentMethod === "cod" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p>You will pay the full amount (₹{total.toFixed(2)}) when your order is delivered.</p>
                <p className="mt-1">Note: For Cash on Delivery orders, please have the exact amount ready at the time of delivery.</p>
              </div>
            )}
          </div>
        </RadioGroup>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
          <Shield size={14} className="text-she-purple" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between border-t border-gray-100 pt-4">
        <Button variant="outline" className="border-she-lavender text-she-purple" onClick={() => setStep("shipping")}>
          Back
        </Button>
        <Button 
          className="bg-she-purple hover:bg-she-indigo text-white" 
          onClick={handlePaymentSubmit}
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Complete Order"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderConfirmationStep = () => (
    <Card className="glass-card text-center py-8">
      <CardContent className="space-y-6">
        <div className="h-20 w-20 bg-she-lavender/30 rounded-full flex items-center justify-center mx-auto">
          <Check size={40} className="text-she-purple" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-she-dark mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been placed and will be processed soon.
          </p>
          <div className="glass-card p-4 rounded-lg bg-white/60 inline-block">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold text-she-purple">SHE-{Math.floor(Math.random() * 10000000)}</p>
          </div>
        </div>
        
        <div className="space-y-2 max-w-md mx-auto text-left">
          <p className="font-medium text-she-dark">Order Details:</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Amount</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span>{paymentMethod === "credit-card" ? "Credit Card (•••• 3456)" : 
                  paymentMethod === "upi" ? "UPI Payment" : "Cash on Delivery"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Delivery</span>
            <span>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
            })} - {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}</span>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 flex items-start max-w-md mx-auto text-left">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>
            A confirmation email has been sent to <strong>{shippingForm.getValues().email || "your email address"}</strong> with your order details.
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button asChild className="bg-she-purple hover:bg-she-indigo text-white">
          <Link to="/orders">
            View My Orders
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-she-lavender text-she-purple">
          <Link to="/shop">
            <ShoppingBag size={16} className="mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-she-dark mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="flex justify-between">
            <div className="flex flex-col items-center space-y-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === "shipping" || step === "payment" || step === "confirmation" 
                  ? "bg-she-purple text-white" : "bg-gray-200 text-gray-500"
              }`}>
                1
              </div>
              <span className="text-sm text-gray-600">Shipping</span>
            </div>
            
            <div className="w-20 md:w-32 h-0.5 bg-gray-200 self-center">
              <div className={`h-full ${
                step === "payment" || step === "confirmation" ? "bg-she-purple" : "bg-gray-200"
              }`}></div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === "payment" || step === "confirmation" 
                  ? "bg-she-purple text-white" : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
              <span className="text-sm text-gray-600">Payment</span>
            </div>
            
            <div className="w-20 md:w-32 h-0.5 bg-gray-200 self-center">
              <div className={`h-full ${
                step === "confirmation" ? "bg-she-purple" : "bg-gray-200"
              }`}></div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === "confirmation" 
                  ? "bg-she-purple text-white" : "bg-gray-200 text-gray-500"
              }`}>
                3
              </div>
              <span className="text-sm text-gray-600">Confirmation</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === "shipping" && renderShippingStep()}
            {step === "payment" && renderPaymentStep()}
            {step === "confirmation" && renderConfirmationStep()}
          </div>
          
          <div className="lg:col-span-1">
            {renderCartSummary()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Checkout;
