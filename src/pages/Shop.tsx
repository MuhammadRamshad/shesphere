import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import ShopProductCard from "@/components/ShopProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts, getProductsByCategory } from "@/services/productService";
import { IProduct } from "@/types";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Shop = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { items } = useCart();

  // Use React Query to fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Determine max price for slider
      if (productsData.length > 0) {
        const maxPrice = Math.max(...productsData.map(product => Number(product.price)));
        setPriceRange([0, maxPrice]);
      }
    }
  }, [productsData]);

  // Get unique categories from products
  const categories = [...new Set(products.flatMap(product => product.category))];

  // Function to handle category change
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category);
    
    if (category === "all") {
      if (productsData) {
        setFilteredProducts(productsData);
      }
    } else {
      try {
        const categoryProducts = await getProductsByCategory(category);
        setFilteredProducts(categoryProducts);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        // Fallback to client-side filtering
        if (productsData) {
          setFilteredProducts(
            productsData.filter(product => product.category.includes(category))
          );
        }
      }
    }
  };

  // Function to handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle price range change
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  // Function to handle category selection
  const handleCategorySelection = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Apply filters based on price range, categories, and search query
  const applyFilters = () => {
    let filtered = products;
    
    // Filter by active category if not 'all'
    if (activeCategory !== "all") {
      filtered = filtered.filter(product => product.category.includes(activeCategory));
    }
    
    // Filter by price range
    filtered = filtered.filter(product => {
      const price = Number(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(cat => product.category.includes(cat))
      );
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredProducts(filtered);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeCategory, priceRange, selectedCategories, products]);

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-she-dark mb-2">Shop Essentials</h1>
            <p className="text-gray-600">Browse and purchase health and wellness products</p>
          </div>
          
          {/* Cart and Orders Buttons */}
          <div className="flex gap-3">
            <Link to="/orders">
              <Button variant="outline" className="flex items-center gap-2">
                <Package size={18} />
                <span>My Orders</span>
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <span>View Cart{cartItemsCount > 0 ? ` (${cartItemsCount})` : ''}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Price Range</h3>
                    <Slider
                      defaultValue={[0, 100]}
                      max={Math.max(100, ...products.map(p => Number(p.price)))}
                      step={1}
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      className="mb-6"
                    />
                    <div className="flex justify-between">
                      <span className="text-sm">${priceRange[0]}</span>
                      <span className="text-sm">${priceRange[1]}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category} className="flex items-center">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategorySelection(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Filter Section */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Price:</span>
              <span className="text-sm">₹{priceRange[0]} - ₹{priceRange[1]}</span>
            </div>
            <div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-4">Price Range</h3>
                      <Slider
                        defaultValue={[0, 100]}
                        max={Math.max(100, ...products.map(p => Number(p.price)))}
                        step={1}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        className="mb-6"
                      />
                      <div className="flex justify-between">
                        <span className="text-sm">₹{priceRange[0]}</span>
                        <span className="text-sm">₹{priceRange[1]}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-4">Categories</h3>
                      <div className="space-y-2">
                        {categories.map(category => (
                          <div key={category} className="flex items-center">
                            <Checkbox
                              id={`desktop-category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategorySelection(category)}
                            />
                            <label
                              htmlFor={`desktop-category-${category}`}
                              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Product Categories Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="period">Period Care</TabsTrigger>
            <TabsTrigger value="hygiene">Hygiene</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-she-purple border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ShopProductCard 
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No products found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
          
          {/* The TabsContent for the other categories will use the same filtered products, 
              filtering is handled via the handleCategoryChange function */}
          <TabsContent value="period" className="space-y-4">
            {/* Content will be handled by handleCategoryChange function */}
          </TabsContent>
          <TabsContent value="hygiene" className="space-y-4">
            {/* Content will be handled by handleCategoryChange function */}
          </TabsContent>
          <TabsContent value="wellness" className="space-y-4">
            {/* Content will be handled by handleCategoryChange function */}
          </TabsContent>
          <TabsContent value="safety" className="space-y-4">
            {/* Content will be handled by handleCategoryChange function */}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Shop;
