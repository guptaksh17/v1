import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Edit, Trash2, User, Calendar, CheckCircle, Plus } from 'lucide-react';
import { Review, ProductRating, fetchProductReviews, fetchProductRating, createReview, updateReview, deleteReview, getUserReview } from '@/lib/reviews';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { addPoints, calculatePoints } from '@/lib/gamification';

interface ReviewsProps {
  productId: string;
  productName: string;
  onReviewCountChange?: (count: number) => void;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

const Reviews: React.FC<ReviewsProps> = ({ productId, productName, onReviewCountChange }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    comment: ''
  });

  // Fetch user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch reviews and rating
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reviewsData, ratingData] = await Promise.all([
          fetchProductReviews(productId),
          fetchProductRating(productId)
        ]);
        setReviews(reviewsData);
        setRating(ratingData);
        onReviewCountChange?.(reviewsData.length);

        // Check if user has already reviewed
        if (user) {
          const existingReview = await getUserReview(productId, user.id);
          setUserReview(existingReview);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        const updatedReview = await updateReview(editingReview.id, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment
        });
        
        if (updatedReview) {
          setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
          setUserReview(updatedReview);
          toast.success('Review updated successfully');
        }
      } else {
        // Create new review
        const newReview = await createReview({
          product_id: productId,
          user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
          user_email: user.email,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment
        });
        
        if (newReview) {
          setReviews(prev => [newReview, ...prev]);
          setUserReview(newReview);
          onReviewCountChange?.(reviews.length + 1);
          toast.success('Review submitted successfully');
          
          // Award points for writing a review
          if (user) {
            const points = calculatePoints.review();
            await addPoints(user.id, points, 'Wrote a helpful review');
            toast.success(`🎉 You earned ${points} points for your review!`);
          }
        }
      }
      
      // Reset form
      setFormData({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Refresh rating
      const newRating = await fetchProductRating(productId);
      setRating(newRating);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setUserReview(null);
      onReviewCountChange?.(reviews.length - 1);
      toast.success('Review deleted successfully');
      
      // Refresh rating
      const newRating = await fetchProductRating(productId);
      setRating(newRating);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || ''
    });
    setShowReviewForm(true);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-amber-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!rating) return null;

    const total = rating.total_reviews;
    if (total === 0) return null;

    return (
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = rating.rating_distribution[star.toString() as keyof typeof rating.rating_distribution] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-8">
                <span className="text-sm font-medium text-gray-700">{star}</span>
                <Star className="h-3 w-3 text-amber-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="text-center lg:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {rating?.average_rating.toFixed(1) || '0.0'}
            </div>
            <div className="flex justify-center lg:justify-start mb-3">
              {renderStars(rating?.average_rating || 0)}
            </div>
            <div className="text-lg text-gray-600 font-medium">
              Based on {rating?.total_reviews || 0} reviews
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && !userReview && !showReviewForm && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Experience</h3>
            <p className="text-gray-600 mb-6">Help other customers by writing a review about this product</p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Write a Review
            </button>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingReview ? 'Edit Your Review' : 'Write Your Review'}
            </h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData(prev => ({ ...prev, rating }))
                  )}
                  <span className="text-lg font-medium text-gray-700 ml-3">
                    {formData.rating} out of 5
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Review Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Summarize your experience in a few words"
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Your Review
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Share your detailed thoughts about this product..."
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setFormData({ rating: 5, title: '', comment: '' });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            Customer Reviews ({reviews.length})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <MessageCircle className="h-16 w-16 mx-auto mb-6 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Be the first to share your experience with this product and help other customers make informed decisions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.user_name}</span>
                        {review.verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(review.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {user && review.user_id === user.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit review"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>
                
                {review.title && (
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{review.title}</h4>
                )}
                
                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful ({review.helpful_votes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 