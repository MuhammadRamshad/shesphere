
import api from './api';
import { IReview } from '@/types';

// Create a new review
export const createReview = async (reviewData: Partial<IReview>): Promise<IReview> => {
  try {
    const response = await api.post('http://localhost:3000/api/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get reviews for a product
export const getProductReviews = async (productId: string): Promise<IReview[]> => {
  try {
    const response = await api.get('/api/reviews', {
      params: { productId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
};

// Update review helpful count
export const updateHelpfulCount = async (reviewId: string, helpful: number): Promise<IReview> => {
  try {
    const response = await api.patch(`/api/reviews/${reviewId}/helpful`, { helpful });
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
};

export default {
  createReview,
  getProductReviews,
  updateHelpfulCount
};
