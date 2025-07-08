-- Add eco_score column to products table (store letter grades)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS eco_score VARCHAR(2) DEFAULT 'C';

-- Add comment to explain the eco_score field
COMMENT ON COLUMN products.eco_score IS 'Environmental grade from A+ to F based on sustainability factors';

-- Create index for better query performance on eco_score
CREATE INDEX IF NOT EXISTS idx_products_eco_score ON products(eco_score);

-- Add constraint to ensure eco_score is a valid grade
ALTER TABLE products 
ADD CONSTRAINT check_eco_score_grade 
CHECK (eco_score IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F'));

-- Update existing products with calculated eco grades based on carbon footprint
UPDATE products 
SET eco_score = CASE 
  WHEN carbon_footprint IS NULL OR carbon_footprint = 0 THEN 'C'
  WHEN carbon_footprint <= 50 THEN 'A+'
  WHEN carbon_footprint <= 100 THEN 'A'
  WHEN carbon_footprint <= 200 THEN 'B'
  WHEN carbon_footprint <= 300 THEN 'C'
  WHEN carbon_footprint <= 400 THEN 'D'
  WHEN carbon_footprint <= 500 THEN 'E'
  ELSE 'F'
END
WHERE eco_score = 'C'; 