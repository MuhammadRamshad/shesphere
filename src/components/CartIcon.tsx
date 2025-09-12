
import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const CartIcon = ({ className }: { className?: string }) => {
  const { totalItems } = useCart();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
    >
      <Link to="/cart">
        <ShoppingCart size={20} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-she-pink text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </Link>
    </Button>
  );
};

export default CartIcon;
