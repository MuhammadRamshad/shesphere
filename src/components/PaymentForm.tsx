
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define the schema for credit card payments
const creditCardSchema = z.object({
  cardNumber: z.string().min(16, {
    message: "Card number must be at least 16 digits.",
  }).max(16, {
    message: "Card number must not exceed 16 digits.",
  }),
  cardName: z.string().min(2, {
    message: "Name on card is required.",
  }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Expiry date must be in MM/YY format.",
  }),
  cvv: z.string().min(3, {
    message: "CVV must be at least 3 digits.",
  }).max(4, {
    message: "CVV must not exceed 4 digits.",
  }),
});

// Props for the PaymentForm component
interface PaymentFormProps {
  paymentMethod: 'credit_card' | 'razorpay';
  onSubmit: (paymentDetails: any) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ paymentMethod, onSubmit }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize the credit card form
  const creditCardForm = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    },
  });

  // Handle credit card submission
  const handleCreditCardSubmit = (data: z.infer<typeof creditCardSchema>) => {
    setIsProcessing(true);
    // Process payment with the submitted data
    onSubmit({
      paymentMethod: 'credit_card',
      ...data,
    });
    setIsProcessing(false);
  };

  // Handle Razorpay submission
  const handleRazorpaySubmit = () => {
    setIsProcessing(true);
    // In a real app, this would integrate with Razorpay SDK
    onSubmit({
      paymentMethod: 'razorpay',
    });
    setIsProcessing(false);
  };

  // Render the credit card form
  const renderCreditCardForm = () => (
    <Form {...creditCardForm}>
      <form onSubmit={creditCardForm.handleSubmit(handleCreditCardSubmit)} className="space-y-4">
        <FormField
          control={creditCardForm.control}
          name="cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name on Card</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={creditCardForm.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input placeholder="1234 5678 9012 3456" {...field} />
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
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input placeholder="MM/YY" {...field} />
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
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full mt-4"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </form>
    </Form>
  );

  // Render the Razorpay payment button
  const renderRazorpayForm = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Click the button below to complete payment using Razorpay. You will be redirected to a secure payment gateway.
      </p>
      <Button
        onClick={handleRazorpaySubmit}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Pay with Razorpay"}
      </Button>
    </div>
  );

  return (
    <div>
      {paymentMethod === 'credit_card' ? renderCreditCardForm() : renderRazorpayForm()}
    </div>
  );
};
