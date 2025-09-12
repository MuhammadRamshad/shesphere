export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  phoneNumber?: string; // Added for compatibility
  bio?: string; // Added for compatibility
  avatarUrl?: string; // Added for compatibility
  dateJoined?: Date; // Added for compatibility
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stockQuantity:number;
  salePrice?: number;
  imageUrl: string;
  category: string[];
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id?: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  trackingNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  _id?: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPeriodData {
  _id?: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  date?: Date; // Added for compatibility with existing code
  periodStart?: boolean; // Added for compatibility with existing code
  periodEnd?: boolean; // Added for compatibility with existing code
  symptoms?: string[];
  flow?: 'light' | 'medium' | 'heavy';
  notes?: string;
  mood?: string[] | string; // Updated to support both array and string
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResource {
  _id?: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast';
  url: string;
  imageUrl?: string;
  category: string[] | string; // Updated to support both array and string
  tags?: string[];
  featured?: boolean;
  videoUrl?: string; // Added for compatibility
  thumbnailUrl?: string; // Added for compatibility
  content?: string; // Added for compatibility
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ISafetyAlert {
  _id?: string;
  userId: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
    latitude?: number; // Optional backward compatibility
    longitude?: number; // Optional backward compatibility
  };
  alertType: "emergency" | "check-in" | "test"; // This is a union type, not just string
  status: string; // This could also be a union type like "active" | "resolved" | "false-alarm"
  contactsNotified: string[];
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISafetyContact {
  _id?: string;
  userId: string;
  name: string;
  phone: string;
  phoneNumber?: string; 
  email: string,// Added for compatibility
  relationship: string;
  isPrimary?: boolean;
  isEmergencyContact?: boolean; // Added for compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISymptom {
  _id?: string;
  name: string;
  category: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscription {
  _id?: string;
  userId: string;
  productId: string;
  planType: string;
  status: 'active' | 'paused' | 'cancelled';
  nextDeliveryDate: Date;
  frequency: number; // In days
  quantity: number;
  price: number;
  startDate: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Server response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: IUser;
  token: string;
}

export interface RegisterResponse {
  user: IUser;
  token: string;
}
