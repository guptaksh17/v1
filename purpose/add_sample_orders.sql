-- Add sample orders for a user to demonstrate rewards dashboard
-- REPLACE 'YOUR_USER_ID_HERE' with your actual user ID from Supabase

-- First, let's add some sample orders using the actual table structure
INSERT INTO orders (product_id, user_id, quantity, price, order_timestamp, product_category, product_name) VALUES
-- Order 1: Apparel items
((SELECT id FROM products WHERE category = 'apparel' LIMIT 1), 'YOUR_USER_ID_HERE', 1, 89.99, NOW() - INTERVAL '5 days', 'apparel', 'Patagonia Organic Cotton T-Shirt'),
((SELECT id FROM products WHERE category = 'apparel' LIMIT 1 OFFSET 1), 'YOUR_USER_ID_HERE', 1, 156.50, NOW() - INTERVAL '3 days', 'apparel', 'Eileen Fisher Hemp Blouse'),
((SELECT id FROM products WHERE category = 'food' LIMIT 1), 'YOUR_USER_ID_HERE', 2, 234.75, NOW() - INTERVAL '1 day', 'food', 'Organic Quinoa Superfood Blend');

-- Create or update user gamification progress using the correct table name
INSERT INTO user_progress (
  user_id,
  level,
  current_points,
  total_points,
  streak_days,
  last_activity_date,
  sustainability_score,
  carbon_offset,
  trees_planted,
  orders_completed,
  total_spent,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE',
  2, -- Green Guardian level
  275, -- Current points
  275, -- Total points
  7, -- 7 day streak
  NOW() - INTERVAL '1 day',
  85, -- High sustainability score
  45.2, -- Carbon offset in kg
  8, -- Trees planted
  3, -- Orders completed
  481.24, -- Total spent
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  level = EXCLUDED.level,
  current_points = EXCLUDED.current_points,
  total_points = EXCLUDED.total_points,
  streak_days = EXCLUDED.streak_days,
  last_activity_date = EXCLUDED.last_activity_date,
  sustainability_score = EXCLUDED.sustainability_score,
  carbon_offset = EXCLUDED.carbon_offset,
  trees_planted = EXCLUDED.trees_planted,
  orders_completed = EXCLUDED.orders_completed,
  total_spent = EXCLUDED.total_spent,
  updated_at = NOW();

-- Add some point transactions to show earning history
INSERT INTO points_transactions (
  user_id,
  points,
  reason,
  created_at
) VALUES
('YOUR_USER_ID_HERE', 50, 'First eco purchase', NOW() - INTERVAL '5 days'),
('YOUR_USER_ID_HERE', 25, 'Order completion', NOW() - INTERVAL '5 days'),
('YOUR_USER_ID_HERE', 75, 'Loyal customer badge', NOW() - INTERVAL '3 days'),
('YOUR_USER_ID_HERE', 30, 'Order completion', NOW() - INTERVAL '3 days'),
('YOUR_USER_ID_HERE', 150, 'Tree planter badge', NOW() - INTERVAL '2 days'),
('YOUR_USER_ID_HERE', 35, 'Order completion', NOW() - INTERVAL '1 day');

-- Add some reviews to show review functionality (with required user_name field)
INSERT INTO reviews (
  user_id,
  product_id,
  user_name,
  rating,
  comment,
  created_at,
  updated_at
) VALUES
('YOUR_USER_ID_HERE', 
 (SELECT id FROM products WHERE category = 'apparel' LIMIT 1),
 'Eco Shopper',
 5,
 'Amazing quality and eco-friendly! Love the sustainable materials.',
 NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '4 days'),
('YOUR_USER_ID_HERE',
 (SELECT id FROM products WHERE category = 'food' LIMIT 1),
 'Eco Shopper',
 4,
 'Great organic product, tastes delicious and good for the planet.',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days');

-- Add points for reviews
INSERT INTO points_transactions (
  user_id,
  points,
  reason,
  created_at
) VALUES
('YOUR_USER_ID_HERE', 10, 'Helpful review', NOW() - INTERVAL '4 days'),
('YOUR_USER_ID_HERE', 10, 'Helpful review', NOW() - INTERVAL '2 days');

-- Update total points to reflect all transactions
UPDATE user_progress 
SET 
  current_points = (
    SELECT COALESCE(SUM(points), 0) 
    FROM points_transactions 
    WHERE user_id = 'YOUR_USER_ID_HERE'
  ),
  total_points = (
    SELECT COALESCE(SUM(points), 0) 
    FROM points_transactions 
    WHERE user_id = 'YOUR_USER_ID_HERE'
  ),
  updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE'; 