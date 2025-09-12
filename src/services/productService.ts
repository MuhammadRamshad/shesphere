
import api from './api';
import { IProduct } from '../types';

// Mock products for fallback in case of API failure
const mockProducts = [
  {
    _id: "1",
    name: "Organic Cotton Pads",
    description: "100% organic cotton, biodegradable pads for sensitive skin",
    price: 8.99,
    salePrice: 7.49,
    imageUrl: "/placeholder.svg",
    category: ["hygiene", "essentials"],
    stockQuantity: 120,
    rating: 4.7,
    reviewCount: 42,
    featured: true
  },
  {
    _id: "2",
    name: "Menstrual Cup - Small",
    description: "Medical-grade silicone cup for comfortable protection",
    price: 24.99,
    imageUrl: "/placeholder.svg",
    category: ["hygiene", "essentials"],
    stockQuantity: 85,
    rating: 4.9,
    reviewCount: 128,
    featured: true
  },
  {
    _id: "3",
    name: "Period Pain Relief Balm",
    description: "Natural balm with essential oils for cramp relief",
    price: 15.99,
    imageUrl: "/placeholder.svg",
    category: ["wellness", "pain-relief"],
    stockQuantity: 67,
    rating: 4.6,
    reviewCount: 38,
    featured: false
  },
  {
    _id: "4",
    name: "Reusable Period Underwear",
    description: "Leak-proof, absorbent underwear for day and night protection",
    price: 32.99,
    salePrice: 27.99,
    imageUrl: "/placeholder.svg",
    category: ["clothing", "essentials"],
    stockQuantity: 54,
    rating: 4.8,
    reviewCount: 96,
    featured: true
  },
  {
    _id: "5",
    name: "Cycle Tracking Journal",
    description: "Daily journal designed for tracking your cycle and symptoms",
    price: 19.99,
    imageUrl: "/placeholder.svg",
    category: ["wellness", "accessories"],
    stockQuantity: 42,
    rating: 4.5,
    reviewCount: 24,
    featured: false
  },
  {
    _id: "6",
    name: "Self-Defense Keychain",
    description: "Compact and stylish safety keychain with alarm feature",
    price: 12.99,
    imageUrl: "/placeholder.svg",
    category: ["safety", "accessories"],
    stockQuantity: 73,
    rating: 4.7,
    reviewCount: 51,
    featured: true
  },
  {
    _id: "7",
    name: "Anxiety Relief Supplement",
    description: "Natural herbal supplement to help manage anxiety and stress",
    price: 28.99,
    imageUrl: "/placeholder.svg",
    category: ["wellness", "supplements"],
    stockQuantity: 62,
    rating: 4.3,
    reviewCount: 37,
    featured: false
  },
  {
    _id: "8",
    name: "Heating Pad - Cordless",
    description: "Rechargeable heating pad for on-the-go pain relief",
    price: 34.99,
    salePrice: 29.99,
    imageUrl: "/placeholder.svg",
    category: ["wellness", "pain-relief"],
    stockQuantity: 31,
    rating: 4.8,
    reviewCount: 64,
    featured: true
  }
];

// Get all products
export const getAllProducts = async (): Promise<IProduct[]> => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return mockProducts as IProduct[];
  }
};

// Get featured products
export const getFeaturedProducts = async (): Promise<IProduct[]> => {
  try {
    const response = await api.get('/products', { params: { featured: true } });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return mockProducts.filter(p => p.featured) as IProduct[];
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<IProduct[]> => {
  try {
    const response = await api.get('/products', { params: { category } });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return mockProducts.filter(p => p.category.includes(category)) as IProduct[];
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    // Check if id is valid
    if (!id || id === "NaN" || id === "undefined") {
      console.error("Invalid product ID:", id);
      return null;
    }
    
    // Ensure id is treated as a string
    const productId = id.toString();
    console.log("Looking for product with ID:", productId);
    
    // Try to find the product in mock data
    const foundProduct = mockProducts.find(p => p._id === productId);
    console.log("Found product from mock data:", foundProduct);
    
    return foundProduct as IProduct || null;
  }
};

// Add product
export const addProduct = async (data: Partial<IProduct>): Promise<IProduct | null> => {
  try {
    const response = await api.post('/products', data);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};
