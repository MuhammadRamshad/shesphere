import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id || ''),
  });

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };


  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        category: Array.isArray(product.category) ? product.category[0] : product.category,
        quantity,
      });
      toast({
        title: "Product added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        category: Array.isArray(product.category) ? product.category[0] : product.category,
        quantity,
      });
      navigate('/checkout');
    }
  };
  
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-10 w-3/4"></div>
                <div className="bg-gray-200 h-6 w-1/4"></div>
                <div className="bg-gray-200 h-4 w-full"></div>
                <div className="bg-gray-200 h-4 w-full"></div>
                <div className="bg-gray-200 h-4 w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/shop')} className="bg-she-purple hover:bg-she-indigo text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/shop')}
            className="text-gray-600 hover:text-she-purple"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
          </Button>
          <Link to="/cart" className="ml-auto">
            <Button variant="outline" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart {cartItemsCount > 0 ? `(${cartItemsCount})` : ''}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="aspect-square bg-white rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            
            <div className="flex items-center space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < (product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.reviewCount} reviews
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-she-indigo">₹{product.price.toFixed(2)}</span>
                {product.salePrice && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ₹{product.salePrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.salePrice && (
                <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                  Save {Math.round(((product.salePrice - product.price) / product.salePrice) * 100)}%
                </span>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center">
                <label htmlFor="quantity" className="text-gray-700 mr-3">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-she-purple"
                  value={quantity}
                  onChange={handleQuantityChange}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-she-purple hover:bg-she-indigo text-white flex-1"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  className="bg-she-indigo hover:bg-she-dark text-white flex-1"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="space-y-3 py-4">
              <div className="flex items-center text-gray-600">
                <Truck className="h-5 w-5 mr-2 text-she-purple" />
                <span>Free delivery on orders over ₹500</span>
              </div>
              <div className="flex items-center text-gray-600">
                <ShieldCheck className="h-5 w-5 mr-2 text-she-purple" />
                <span>2 year warranty</span>
              </div>
            </div>
          </div>
        </div>
      





        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full mb-8 justify-start border-b pb-0">
            <TabsTrigger value="details" className="rounded-t-lg border-b-0">
              Product Details
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-t-lg border-b-0">
              Reviews ({product.reviewCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.category.map((cat, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Availability</h4>
                    <p className={Number(product.stockQuantity) > 0 ? "text-green-600" : "text-red-600"}>
                   {Number(product.stockQuantity) > 0 ? `In Stock`: "Out of Stock"}
                    </p>
                  </div>
                </div>
                <Separator className="my-6" />
                <p className="text-gray-600">
                {product.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  See what our customers are saying about this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < (product.rating || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">
                        Based on {product.reviewCount} reviews
                      </span>
                    </div>
                    <Button className="bg-she-purple hover:bg-she-indigo text-white">
                      Write a Review
                    </Button>
                  </div>
                  <Separator />
                  
                  {/* Sample reviews - would be replaced with real data */}
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h4 className="font-semibold">Sarah J.</h4>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-500 text-sm">2 months ago</span>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Great product! Exactly as described and arrived quickly. Would definitely
                        recommend to others looking for quality women's health products.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h4 className="font-semibold">Priya M.</h4>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-500 text-sm">1 month ago</span>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Good product overall. I would have given 5 stars but the shipping took a bit
                        longer than expected. The quality is excellent though.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Load More Reviews
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProductDetails;
