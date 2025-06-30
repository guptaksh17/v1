-- Add new columns for enhanced carbon footprint calculation
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS sustainability_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS carbon_footprint_breakdown JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10, 2);

-- Add weight_kg to existing products if not set
-- This is a basic migration - you might want to update this with more specific logic
-- based on your existing data
UPDATE products 
SET weight_kg = 1.0 
WHERE weight_kg IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_carbon_footprint ON products(carbon_footprint);
CREATE INDEX IF NOT EXISTS idx_products_sustainability_data ON products USING GIN (sustainability_data);

-- Update RLS policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable read access for all users') THEN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
    CREATE POLICY "Enable read access for all users" 
    ON public.products 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);
  END IF;

  -- Update insert policy to include new columns
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable insert for authenticated users only') THEN
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
    CREATE POLICY "Enable insert for authenticated users only" 
    ON public.products 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
  END IF;

  -- Update update policy to include new columns
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable update for users based on user_id') THEN
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.products;
    CREATE POLICY "Enable update for users based on user_id" 
    ON public.products 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;
