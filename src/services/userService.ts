
import api from './api';
import { IUser } from '@/types';
import { authService } from './authService';

// Get the current user
export const getCurrentUser = async (): Promise<IUser | null> => {
  try {
    // First check if we have a user in local storage
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser || !currentUser._id) {
      return null;
    }
    
    // Get the latest user data from the API
    const response = await api.get(`/users/${currentUser._id}`);
    
    if (response.data.success && response.data.user) {
      return response.data.user;
    }
    
    return currentUser;
  } catch (error) {
    console.error('Error fetching current user:', error);
    
    // Fallback to local storage
    return authService.getCurrentUser();
  }
};

// Update user profile
export const updateUserProfile = async (userData: Partial<IUser>): Promise<IUser> => {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      throw new Error('No authenticated user found');
    }
    
    const success = await authService.updateUserProfile(currentUser._id, userData);
    
    if (success) {
      const updatedUser = authService.getCurrentUser();
      return updatedUser as IUser;
    }
    
    throw new Error('Failed to update profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
