
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { IProduct } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

interface ShopProductCardProps {
  product: IProduct;
}

const ShopProductCard: React.FC<ShopProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: Array.isArray(product.category) ? product.category[0] : product.category,
      quantity: 1,
    });
    
    toast("Product added to cart", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col border-she-lavender/20 hover:border-she-indigo/50 transition-all duration-300 hover:shadow-md bg-white">
      <Link to={`/product/${product._id}`} className="h-full flex flex-col">
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-white">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          </div>
          {product.salePrice && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {Math.round(((product.salePrice - product.price) / product.salePrice) * 100)}% OFF
            </span>
          )}
        </div>
        <CardHeader className="py-4 px-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-she-dark line-clamp-1">
              {product.name}
            </CardTitle>
          </div>
          <CardDescription className="line-clamp-2 text-sm text-gray-600">
            {product.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-2 pt-0 flex-grow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < (product.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-she-indigo">₹{product.price.toFixed(2)}</span>
            {product.salePrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ₹{product.salePrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 pt-2 pb-4">
          <div className="flex space-x-2 w-full">
            <Button
              className="bg-she-purple hover:bg-she-indigo text-white w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ShopProductCard;
