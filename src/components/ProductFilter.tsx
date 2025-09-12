
import React, { useState, useEffect } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  X, 
  BadgeIndianRupee,
} from "lucide-react";

// Product filter component
interface ProductFilterProps {
  categories: string[];
  onFilter: (filters: any) => void;
  maxPrice: number;
  minPrice: number;
  className?: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ 
  categories, 
  onFilter,
  maxPrice,
  minPrice,
  className = ""
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice]);
  const [inStock, setInStock] = useState<boolean>(false);
  const [onSale, setOnSale] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);

  // Category filter handler
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Apply filters
  useEffect(() => {
    const filters = {
      categories: selectedCategories,
      priceRange,
      inStock,
      onSale,
    };
    
    // Count active filters
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > minPrice || priceRange[1] < maxPrice) count++;
    if (inStock) count++;
    if (onSale) count++;
    
    setActiveFilters(count);
    onFilter(filters);
  }, [selectedCategories, priceRange, inStock, onSale]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([minPrice, maxPrice]);
    setInStock(false);
    setOnSale(false);
  };

  // Format price with rupee symbol
  const formatPriceWithRupeeSymbol = (price: number) => {
    return `₹${price}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Filters</h3>
        {activeFilters > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear All <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map(category => (
            <Badge 
              key={category} 
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1"
            >
              {category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleCategoryChange(category)}
              />
            </Badge>
          ))}
          
          {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
            <Badge 
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1"
            >
              <BadgeIndianRupee className="h-3 w-3" />
              {priceRange[0]} - {priceRange[1]}
              <X 
                className="h-3 w-3 cursor-pointer ml-1" 
                onClick={() => setPriceRange([minPrice, maxPrice])}
              />
            </Badge>
          )}
          
          {inStock && (
            <Badge 
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1"
            >
              In Stock
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setInStock(false)}
              />
            </Badge>
          )}
          
          {onSale && (
            <Badge 
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1"
            >
              On Sale
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setOnSale(false)}
              />
            </Badge>
          )}
        </div>
      )}

      <Accordion type="multiple" defaultValue={["categories", "price", "availability"]}>
        {/* Category filter */}
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={minPrice}
                max={maxPrice}
                step={10}
                onValueChange={setPriceRange}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <BadgeIndianRupee className="h-4 w-4 mr-1 text-gray-500" />
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value, 10), priceRange[1]])}
                    className="w-20 h-8 text-sm"
                    min={minPrice}
                    max={priceRange[1]}
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex items-center">
                  <BadgeIndianRupee className="h-4 w-4 mr-1 text-gray-500" />
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                    className="w-20 h-8 text-sm"
                    min={priceRange[0]}
                    max={maxPrice}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability filter */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inStock"
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(checked === true)}
                />
                <label
                  htmlFor="inStock"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  In Stock Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="onSale"
                  checked={onSale}
                  onCheckedChange={(checked) => setOnSale(checked === true)}
                />
                <label
                  htmlFor="onSale"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  On Sale
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductFilter;
