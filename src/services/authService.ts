
import api from '@/services/api';
import { IUser, LoginResponse, RegisterResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private isNewUserKey = 'is_new_user';
  
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        localStorage.setItem(this.tokenKey, response.data.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Create a dummy user for development if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating mock user in development');
        const mockUser = this.createMockUser(email);
        localStorage.setItem(this.userKey, JSON.stringify(mockUser));
        localStorage.setItem(this.tokenKey, 'mock-token-for-development');
        localStorage.setItem(this.isNewUserKey, 'true');
        return true;
      }
      
      throw error;
    }
  }
  
  async signup(data: RegisterData): Promise<boolean> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      
      if (response.data && response.data.token) {
        localStorage.setItem(this.tokenKey, response.data.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
        localStorage.setItem(this.isNewUserKey, 'true');
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Create a dummy user for development if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating mock user in development');
        const mockUser = this.createMockUser(data.email, data.name);
        localStorage.setItem(this.userKey, JSON.stringify(mockUser));
        localStorage.setItem(this.tokenKey, 'mock-token-for-development');
        localStorage.setItem(this.isNewUserKey, 'true');
        return true;
      }
      
      throw error;
    }
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
  
  getCurrentUser(): IUser | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey) && !!this.getCurrentUser();
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  async updateUserProfile(userId: string, userData: Partial<IUser>): Promise<IUser> {
    try {
      const response = await api.put<IUser>(`/users/${userId}`, userData);
      
      // Update the stored user data
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle offline updates in development mode
      if (process.env.NODE_ENV === 'development') {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
          return updatedUser;
        }
      }
      
      throw error;
    }
  }
  
  // Add setUserAsNotNew method used in PreviousCycleForm
  setUserAsNotNew(): void {
    localStorage.setItem(this.isNewUserKey, 'false');
  }
  
  isNewUser(): boolean {
    return localStorage.getItem(this.isNewUserKey) === 'true';
  }
  
  private createMockUser(email: string, name: string = 'Test User'): IUser {
    const firstName = name.split(' ')[0] || 'Test';
    
    return {
      _id: `mock_${Date.now()}`,
      name: name,
      email: email,
      role: 'user',
      phone: '+1234567890',
      phoneNumber: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      bio: `I am ${firstName}, using the SheSpere app for my health and safety.`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff`,
      dateJoined: new Date(),
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'California',
        zipCode: '12345',
        country: 'USA'
      }
    };
  }
}

export const authService = new AuthService();
export default authService;
