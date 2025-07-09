import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRating {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface CreateReviewData {
  product_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}

/**
 * Fetch reviews for a product
 */
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch product rating statistics
 */
export async function fetchProductRating(productId: string): Promise<ProductRating | null> {
  const { data, error } = await supabase
    .rpc('calculate_product_rating', { product_uuid: productId });

  if (error) {
    console.error('Error fetching product rating:', error);
    return null;
  }

  if (data && data.length > 0) {
    const result = data[0];
    return {
      average_rating: parseFloat(result.average_rating?.toString() || '0'),
      total_reviews: parseInt(result.total_reviews?.toString() || '0'),
      rating_distribution: (result.rating_distribution as any) || {
        '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
      }
    };
  }

  return {
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  };
}

/**
 * Create a new review
 */
export async function createReview(reviewData: CreateReviewData): Promise<Review | null> {
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a review');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      ...reviewData,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an existing review
 */
export async function updateReview(reviewId: string, updateData: UpdateReviewData): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Vote a review as helpful
 */
export async function voteReviewHelpful(reviewId: string): Promise<boolean> {
  // First get the current helpful_votes count
  const { data: currentReview, error: fetchError } = await supabase
    .from('reviews')
    .select('helpful_votes')
    .eq('id', reviewId)
    .single();

  if (fetchError) {
    console.error('Error fetching current review:', fetchError);
    throw new Error(fetchError.message);
  }

  // Increment the helpful_votes count
  const { error } = await supabase
    .from('reviews')
    .update({ helpful_votes: (currentReview.helpful_votes || 0) + 1 })
    .eq('id', reviewId);

  if (error) {
    console.error('Error voting review helpful:', error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Check if user has already reviewed a product
 */
export async function hasUserReviewedProduct(productId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error checking user review:', error);
    return false;
  }

  return !!data;
}

/**
 * Get user's existing review for a product
 */
export async function getUserReview(productId: string, userId?: string): Promise<Review | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user review:', error);
    return null;
  }

  return data;
} 