-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Enable RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read reviews
CREATE POLICY "Allow public read access to reviews" ON reviews
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Allow authenticated users to insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_product_rating(product_uuid UUID)
RETURNS TABLE (
  average_rating DECIMAL(3,2),
  total_reviews INTEGER,
  rating_distribution JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(r.rating)::DECIMAL, 2) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    json_build_object(
      '1', COUNT(*) FILTER (WHERE r.rating = 1),
      '2', COUNT(*) FILTER (WHERE r.rating = 2),
      '3', COUNT(*) FILTER (WHERE r.rating = 3),
      '4', COUNT(*) FILTER (WHERE r.rating = 4),
      '5', COUNT(*) FILTER (WHERE r.rating = 5)
    ) as rating_distribution
  FROM reviews r
  WHERE r.product_id = product_uuid;
END;
$$ LANGUAGE plpgsql; 