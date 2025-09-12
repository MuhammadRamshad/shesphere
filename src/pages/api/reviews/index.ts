
import Review, { IReview } from '@/models/Review';
import connectDB from '@/lib/db';

// API handler for reviews
export async function handleReviewsRequest(req: { 
  method: string; 
  body?: any; 
  query?: { productId?: string };
}) {
  // Connect to MongoDB
  await connectDB();
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        const productId = req.query?.productId;
        
        if (!productId) {
          return { status: 400, data: { error: 'Product ID is required' } };
        }
        
        // Use as any to avoid TypeScript union type error
        const reviews = await (Review as any).find({ productId }).sort({ createdAt: -1 });
        
        // Convert to plain objects
        const plainReviews = reviews.map((review: any) => review.toObject ? review.toObject() : review);
        
        return { status: 200, data: plainReviews };
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return { status: 500, data: { error: 'Failed to fetch reviews' } };
      }
      
    case 'POST':
      try {
        const data = req.body;
        
        if (!data.userId || !data.productId) {
          return { status: 400, data: { error: 'User ID and Product ID are required' } };
        }
        
        // Create a review using new + save instead of create
        const reviewDoc = new Review(data);
        const review = await reviewDoc.save();
        
        return { status: 201, data: review.toObject ? review.toObject() : review };
      } catch (error) {
        console.error('Error creating review:', error);
        return { status: 500, data: { error: 'Failed to create review' } };
      }
      
    default:
      return { status: 405, data: { error: 'Method not allowed' } };
  }
}
