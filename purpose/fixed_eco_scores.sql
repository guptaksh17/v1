-- Step 1: Add a temporary column to store the new eco scores
ALTER TABLE products 
ADD COLUMN eco_score_new VARCHAR(2);

-- Step 2: Populate the new column with letter grades based on carbon footprint
UPDATE products 
SET eco_score_new = CASE 
    WHEN carbon_footprint <= 5 THEN 'A+'
    WHEN carbon_footprint <= 10 THEN 'A'
    WHEN carbon_footprint <= 20 THEN 'B'
    WHEN carbon_footprint <= 35 THEN 'C'
    WHEN carbon_footprint <= 50 THEN 'D'
    WHEN carbon_footprint <= 75 THEN 'E'
    ELSE 'F'
END
WHERE carbon_footprint IS NOT NULL;

-- Step 3: Set default 'C' for products without carbon footprint data
UPDATE products 
SET eco_score_new = 'C'
WHERE eco_score_new IS NULL;

-- Step 4: Drop the old eco_score column (this will also drop any constraints on it)
ALTER TABLE products 
DROP COLUMN eco_score;

-- Step 5: Rename the new column to eco_score
ALTER TABLE products 
RENAME COLUMN eco_score_new TO eco_score;

-- Step 6: Add constraint to ensure only valid letter grades (with a unique name)
ALTER TABLE products 
ADD CONSTRAINT eco_score_letter_grades CHECK (eco_score IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F')); 