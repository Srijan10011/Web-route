import React, { useState } from 'react';
import { Star, MessageCircle, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  useCanUserReviewQuery, 
  useUserReviewQuery, 
  useProductReviewsQuery,
  useProductReviewStatsQuery,
  useSubmitReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  Review 
} from '../lib/reviewQueries';

interface ReviewSectionProps {
  productId: number;
  userId?: string;
}

interface ReviewFormProps {
  productId: number;
  userId: string;
  existingReview?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StarRating = ({ rating, onRatingChange, readonly = false }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${
            readonly ? '' : 'cursor-pointer'
          } ${
            star <= (hoverRating || rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        />
      ))}
    </div>
  );
};

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, userId, existingReview, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReviewMutation = useSubmitReviewMutation();
  const updateReviewMutation = useUpdateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: existingReview.id,
          rating,
          comment
        });
      } else {
        await submitReviewMutation.mutateAsync({
          userId,
          productId,
          rating,
          comment
        });
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating rating={rating} onRatingChange={setRating} />
          {rating === 0 && (
            <p className="text-sm text-red-600 mt-1">Please select a rating</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Share your experience with this product..."
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

const ReviewItem: React.FC<{ 
  review: Review; 
  isOwnReview: boolean; 
  onEdit?: () => void; 
  onDelete?: () => void;
}> = ({ review, isOwnReview, onEdit, onDelete }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.user_name}</p>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} readonly />
              <span className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {isOwnReview && (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 p-1 h-auto"
              title="Edit review"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 p-1 h-auto"
              title="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {review.comment && (
        <p className="text-gray-700 ml-13">{review.comment}</p>
      )}
    </div>
  );
};

export default function ReviewSection({ productId, userId }: ReviewSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  const { data: canReview = false, isLoading: canReviewLoading } = useCanUserReviewQuery(userId, productId);
  const { data: userReview, isLoading: userReviewLoading } = useUserReviewQuery(userId, productId);
  const { data: reviews = [], isLoading: reviewsLoading } = useProductReviewsQuery(productId);
  const { data: reviewStats, isLoading: statsLoading } = useProductReviewStatsQuery(productId);
  const deleteReviewMutation = useDeleteReviewMutation();

  const handleDeleteReview = async () => {
    if (!userReview || !confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await deleteReviewMutation.mutateAsync(userReview.id);
      setEditingReview(null);
    } catch (error: any) {
      console.error('Error deleting review:', error);
      alert(`Failed to delete review: ${error.message}`);
    }
  };

  const handleEditReview = () => {
    setEditingReview(userReview);
    setShowReviewForm(true);
  };

  const handleFormSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleFormCancel = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  // Show loading state
  if (canReviewLoading || userReviewLoading || reviewsLoading || statsLoading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        {reviewStats && (
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(reviewStats.average_rating)} readonly />
              <span className="text-lg font-semibold">{reviewStats.average_rating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-600">{reviewStats.review_count} reviews</p>
          </div>
        )}
      </div>

      {/* Review eligibility and form */}
      {userId && (
        <div className="mb-8">
          {!canReview && !userReview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  You can only review products from your delivered orders.
                </p>
              </div>
            </div>
          )}

          {canReview && !userReview && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Write a Review
            </Button>
          )}

          {userReview && !showReviewForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-blue-800">You have already reviewed this product.</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditReview}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteReview}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete Review
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showReviewForm && userId && (canReview || editingReview) && (
            <div className="mb-6">
              <ReviewForm
                productId={productId}
                userId={userId}
                existingReview={editingReview}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      <div>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isOwnReview={userReview?.id === review.id}
                onEdit={userReview?.id === review.id ? handleEditReview : undefined}
                onDelete={userReview?.id === review.id ? handleDeleteReview : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}