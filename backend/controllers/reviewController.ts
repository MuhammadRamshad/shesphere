
import { Request, Response } from 'express';
import { Review, Product } from '../models';

// Get reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Create a new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const reviewData = req.body;
    
    if (!reviewData.userId || !reviewData.productId) {
      return res.status(400).json({ error: 'User ID and Product ID are required' });
    }
    
    const review = new Review(reviewData);
    await review.save();
    
    // Update product's review count and rating
    const product = await Product.findById(reviewData.productId);
    if (product) {
      // Get all reviews for this product
      const allReviews = await Review.find({ productId: reviewData.productId });
      
      // Calculate new average rating
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const newAvgRating = totalRating / allReviews.length;
      
      // Update product
      await Product.findByIdAndUpdate(
        reviewData.productId,
        { 
          rating: parseFloat(newAvgRating.toFixed(1)), 
          reviewCount: allReviews.length
        }
      );
    }
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update review helpful count
export const updateHelpfulCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { helpful },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.status(200).json(review);
  } catch (error) {
    console.error(`Error updating review ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};
