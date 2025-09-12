
import { useContext } from "react";
import { CartContext as CartContextType, CartItem, CartProvider } from "@/contexts/CartContext";

export function useCart() {
  const context = useContext(CartContextType);
  
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  // Calculate total price
  const calculateTotal = () => {
    return context.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Convert to an array of cart items compatible with IOrderItem
  const cartItems = context.items.map((item) => ({
    _id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));
  
  return {
    ...context,
    cartItems,
    calculateTotal,
  };
}

// Re-export CartProvider for convenience
export { CartProvider };
