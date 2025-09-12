
import React from "react";
import AppLayout from "@/components/AppLayout";
import { useCart } from "@/hooks/use-cart";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { toast } = useToast();

  const handleRemoveItem = (id: string) => {  // Changed from number to string
    removeFromCart(id);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-she-dark mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add items to your cart to see them here</p>
            <Button asChild className="bg-she-purple hover:bg-she-indigo text-white">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-12">
        <Link to="/shop" className="inline-flex items-center text-she-purple hover:text-she-indigo mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Continue Shopping
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-she-dark mb-2">Your Cart</h1>
          <p className="text-gray-600">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="glass-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-she-dark">{item.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center font-medium text-she-purple">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                            {item.price}
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="text-gray-700 w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                          <div className="flex">
                            <Button
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-she-dark mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <div className="flex items-center font-medium">
                      <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                      {totalPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <div className="flex items-center">
                      <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                      {(totalPrice * 0.10).toFixed(2)}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 my-4 pt-4">
                    <div className="flex justify-between text-lg font-bold text-she-dark">
                      <span>Total</span>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-0.5" />
                        {(totalPrice + totalPrice * 0.10).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full bg-she-purple hover:bg-she-indigo text-white"
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Cart;
