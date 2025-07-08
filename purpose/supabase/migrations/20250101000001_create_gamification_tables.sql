-- Create gamification tables for user rewards and progress tracking

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER DEFAULT 1,
  current_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  streak_days INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sustainability_score INTEGER DEFAULT 0,
  carbon_offset DECIMAL(10,2) DEFAULT 0, -- in kg CO2
  trees_planted INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON points_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reward_redemptions
CREATE POLICY "Users can view their own redemptions" ON reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemptions" ON reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_updated_at(); 