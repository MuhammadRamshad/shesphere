
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders, updateOrderStatus } from "@/services/orderService";
import { IOrder } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Calendar,
  ShoppingBag,
  Clock,
  Check,
  X,
  Truck,
  ArrowRight,
  Package2,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/authService";

// Helper function to render status badge with appropriate color
const renderStatusBadge = (status: string) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(status)} capitalize`}>
      {status}
    </Badge>
  );
};

// Helper function to get status step information
const getStatusSteps = (status: string) => {
  const steps = [
    { name: "Order Placed", icon: ShoppingBag, done: true },
    { name: "Processing", icon: Package2, done: ["processing", "shipped", "delivered"].includes(status) },
    { name: "Shipped", icon: Truck, done: ["shipped", "delivered"].includes(status) },
    { name: "Delivered", icon: PackageCheck, done: status === "delivered" }
  ];

  // If cancelled, override all steps
  if (status === "cancelled") {
    return steps.map(step => ({ ...step, done: false }));
  }

  return steps;
};

// OrderCard component for displaying individual orders
interface OrderCardProps {
  order: IOrder;
  onCancel: (orderId: string) => Promise<void>;
  onReturn: (orderId: string) => Promise<void>;
  onReview: (orderId: string) => void;
  isActive: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onCancel, onReturn, onReview, isActive }) => {
  const [showDetails, setShowDetails] = useState(false);
  const canCancel = isActive && ["pending", "processing"].includes(order.status);
  const canReturn = isActive && order.status === "delivered";
  const canReview = order.status === "delivered";

  const statusSteps = getStatusSteps(order.status);

  return (
    <Card className="mb-6 overflow-hidden border border-gray-200">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">SHE #{order._id?.substring(0, 8)}</CardTitle>
            <CardDescription>
              Placed on {new Date(order.createdAt || new Date()).toLocaleDateString()}
            </CardDescription>
          </div>
          {renderStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <h4 className="font-medium mb-2">Order Items</h4>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">₹{order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order progress steps */}
        <div className="my-6">
          <div className="flex items-center">
            {statusSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {step.done ? (
                      <Check size={16} />
                    ) : (
                      <step.icon size={16} />
                    )}
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      step.done ? "text-green-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`h-0.5 w-16 ${
                      step.done ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Toggle details button */}
        <Button
          variant="ghost"
          className="w-full text-sm justify-between"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
          <ArrowRight size={16} className={`transition-transform ${showDetails ? "rotate-90" : ""}`} />
        </Button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            {/* Shipping info */}
            <div>
              <h4 className="font-medium text-sm mb-2">Shipping Address</h4>
              <p className="text-sm">
                {order.customerName}<br />
                {order.shippingAddress.street}, {order.shippingAddress.city},<br />
                {order.shippingAddress.state} {order.shippingAddress.zipCode},<br />
                {order.shippingAddress.country}<br/>
                {order.customerPhone}
              </p>
            </div>

            {/* Payment info */}
            <div>
              <h4 className="font-medium text-sm mb-2">Payment Info</h4>
              <p className="text-sm">
                Method: {order.paymentMethod}
                <br />
                Status: <span className="capitalize">{order.paymentStatus}</span>
              </p>
            </div>

            {/* Order total */}
            <div className="pt-2">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="font-medium">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Shipping</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 justify-end border-t bg-gray-50 px-6">
        {canCancel && (
          <Button variant="outline" onClick={() => onCancel(order._id || "")} className="text-red-600 border-red-200 hover:bg-red-50">
            Cancel Order
          </Button>
        )}
        {canReturn && (
          <Button variant="outline" onClick={() => onReturn(order._id || "")} className="text-amber-600 border-amber-200 hover:bg-amber-50">
            Return Order
          </Button>
        )}
        {canReview && (
          <Button variant="outline" onClick={() => onReview(order._id || "")} className="text-blue-600 border-blue-200 hover:bg-blue-50">
            Write Review
          </Button>
        )}
        <Button variant="outline">Track Package</Button>
      </CardFooter>
    </Card>
  );
};

// Review Modal Component
interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, title: string, content: string) => Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const handleSubmit = async () => {
    await onSubmit(rating, title, content);
    // Reset form
    setRating(5);
    setTitle("");
    setContent("");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product to help other customers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={`${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Review Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Review Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Summarize your experience"
            />
          </div>
          
          {/* Review Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
              placeholder="Tell others about your experience with this product"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-she-purple hover:bg-she-indigo"
            onClick={handleSubmit}
            disabled={content.trim().length === 0}
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main OrderTracking Component
const OrderTracking: React.FC = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  
  // Get current user ID from auth service
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?._id || 'mock-user-1';
  
  // Fetch orders with correct error handling for React Query v5+
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['userOrders', userId],
    queryFn: () => getUserOrders(userId),
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error("Error fetching orders:", error);
        toast.error("Could not load orders. Please try again later.");
      }
    }
  });

  // Handle order actions
  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'cancelled');
      toast.success('Order cancelled successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    try {
      // In a real app, this would call an API to create a return request
      toast.success('Return request submitted');
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  const handleReviewClick = (orderId: string) => {
    // Find the order and get the first product for review
    const order = orders.find(o => o._id === orderId);
    if (order && order.items.length > 0) {
      setSelectedOrderId(orderId);
      setSelectedProductId(order.items[0].productId);
      setSelectedProductName(order.items[0].name);
      setShowReviewModal(true);
    }
  };

  const handleSubmitReview = async (rating: number, title: string, content: string) => {
    try {
      // Prepare review data
      const reviewData = {
        userId,
        productId: selectedProductId,
        rating,
        title,
        content,
        verified: true
      };

      // Call API to submit review
      const response = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit your review. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="text-center py-12">
            <X className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Could not load orders</h3>
            <p className="text-gray-500 mb-6">There was a problem connecting to the server.</p>
            <Button onClick={() => refetch()} className="bg-she-purple hover:bg-she-indigo">
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-she-dark mb-2">My Orders</h1>
          <p className="text-gray-500">Track, manage and view your order history</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onCancel={handleCancelOrder} 
                onReturn={handleReturnOrder}
                onReview={handleReviewClick}
                isActive={['pending', 'processing', 'shipped'].includes(order.status)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Button className="bg-she-purple hover:bg-she-indigo">
              Shop Now
            </Button>
          </div>
        )}
      </div>
      
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
      />
    </AppLayout>
  );
};

export default OrderTracking;
