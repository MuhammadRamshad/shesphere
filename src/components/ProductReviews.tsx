
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductReviews, updateHelpfulCount } from '@/services/reviewService';
import { Star, StarHalf, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IReview } from '@/types';
import { Separator } from '@/components/ui/separator';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => getProductReviews(productId),
  });

  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  // Handle marking a review as helpful
  const handleMarkHelpful = async (reviewId: string) => {
    if (helpfulCounts[reviewId]) return; // Prevent multiple clicks
    
    try {
      const currentCount = reviews.find(r => r._id === reviewId)?.helpful || 0;
      const newCount = currentCount + 1;
      
      // Update UI optimistically
      setHelpfulCounts({
        ...helpfulCounts,
        [reviewId]: newCount
      });
      
      // Update on server
      await updateHelpfulCount(reviewId, newCount);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300 h-4 w-4" />);
    }
    
    return stars;
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-md"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
      
      {reviews.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Rating summary */}
            <div className="w-full md:w-1/3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-2">out of 5</span>
                </div>
                
                <div className="flex mb-2">
                  {renderStars(averageRating)}
                </div>
                
                <p className="text-sm text-gray-500 mb-4">Based on {reviews.length} reviews</p>
                
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center text-sm">
                      <div className="w-12">{rating} stars</div>
                      <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Reviews list */}
            <div className="w-full md:w-2/3">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      
                      {review.verified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    
                    {review.title && (
                      <h4 className="font-semibold mb-1">{review.title}</h4>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <div className="flex items-center mr-4">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>
                            {getInitials("User")}
                          </AvatarFallback>
                        </Avatar>
                        <span>Customer</span>
                      </div>
                      <span>
                        {new Date(review.createdAt || new Date()).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 text-sm"
                      onClick={() => handleMarkHelpful(review._id || "")}
                      disabled={!!helpfulCounts[review._id || ""]}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful ({helpfulCounts[review._id || ""] || review.helpful})
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-500 mb-4">No reviews yet</p>
          <p className="text-sm">Be the first to review this product</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
