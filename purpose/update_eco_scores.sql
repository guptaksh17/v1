-- First, change the eco_score column type to VARCHAR(2) to store letter grades
ALTER TABLE products 
ALTER COLUMN eco_score TYPE VARCHAR(2);

-- Add constraint to ensure only valid letter grades
ALTER TABLE products 
ADD CONSTRAINT valid_eco_score CHECK (eco_score IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F'));

-- Update existing products with proper letter grades (if any exist)
UPDATE products 
SET eco_score = CASE 
    WHEN carbon_footprint <= 5 THEN 'A+'
    WHEN carbon_footprint <= 10 THEN 'A'
    WHEN carbon_footprint <= 20 THEN 'B'
    WHEN carbon_footprint <= 35 THEN 'C'
    WHEN carbon_footprint <= 50 THEN 'D'
    WHEN carbon_footprint <= 75 THEN 'E'
    ELSE 'F'
END
WHERE eco_score IS NULL OR eco_score ~ '^[0-9]+$';

-- Insert high-rated eco-friendly products across all categories

-- APPAREL CATEGORY (A+ to A grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Apparel
('Patagonia Organic Cotton T-Shirt', 'Premium organic cotton t-shirt made with 100% certified organic cotton. Fair trade certified and made in renewable energy facilities.', 45.00, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'apparel', 'Patagonia', ARRAY['organic cotton'], 'USA', 3.2, 'A+', NOW(), NOW()),

('Eileen Fisher Hemp Blouse', 'Elegant hemp blouse made from sustainable hemp fabric. Naturally antimicrobial and requires less water to grow than cotton.', 89.00, 30, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', 'apparel', 'Eileen Fisher', ARRAY['hemp'], 'USA', 2.8, 'A+', NOW(), NOW()),

('Reformation Bamboo Dress', 'Beautiful dress made from sustainable bamboo fabric. Soft, breathable, and naturally antibacterial.', 128.00, 25, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', 'apparel', 'Reformation', ARRAY['bamboo'], 'USA', 4.1, 'A+', NOW(), NOW()),

-- A Grade Apparel
('Stella McCartney Recycled Polyester Jacket', 'Luxury jacket made from 100% recycled polyester. Vegan and cruelty-free design.', 450.00, 15, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 'apparel', 'Stella McCartney', ARRAY['recycled polyester'], 'Italy', 8.5, 'A', NOW(), NOW()),

('Veja Organic Cotton Sneakers', 'Sustainable sneakers made with organic cotton canvas and natural rubber soles. Fair trade certified.', 150.00, 40, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'apparel', 'Veja', ARRAY['organic cotton', 'natural rubber'], 'Brazil', 12.3, 'A', NOW(), NOW()),

('Outerknown Linen Shirt', 'Classic linen shirt made from European flax. Naturally wrinkle-resistant and biodegradable.', 95.00, 35, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'apparel', 'Outerknown', ARRAY['linen'], 'Portugal', 6.8, 'A', NOW(), NOW());

-- FOOD & BEVERAGES CATEGORY (A+ to A grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Food
('Organic Quinoa Superfood Blend', 'Premium organic quinoa blend with ancient grains. Grown without pesticides and fair trade certified.', 18.99, 100, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 'food', 'Ancient Harvest', ARRAY['organic quinoa', 'organic amaranth'], 'Peru', 0.8, 'A+', NOW(), NOW()),

('Fair Trade Organic Coffee', 'Single-origin organic coffee beans from sustainable farms. Rainforest Alliance certified.', 24.99, 80, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400', 'food', 'Equal Exchange', ARRAY['organic coffee'], 'Colombia', 1.2, 'A+', NOW(), NOW()),

('Local Honey Raw & Unfiltered', 'Pure raw honey from local beekeepers. Supports pollinator health and local agriculture.', 15.99, 60, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 'food', 'Local Bee Co', ARRAY['raw honey'], 'Local', 0.3, 'A+', NOW(), NOW()),

-- A Grade Food
('Organic Dark Chocolate', '70% organic dark chocolate made with fair trade cocoa beans. Rainforest Alliance certified.', 8.99, 120, 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', 'food', 'Alter Eco', ARRAY['organic cocoa', 'organic sugar'], 'Switzerland', 2.1, 'A', NOW(), NOW()),

('Plant-Based Protein Powder', 'Complete protein powder made from organic peas, rice, and hemp. Vegan and non-GMO.', 32.99, 75, 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400', 'food', 'Garden of Life', ARRAY['organic pea protein', 'organic hemp'], 'USA', 3.5, 'A', NOW(), NOW());

-- HOME & LIFESTYLE CATEGORY (A+ to A grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Home
('Bamboo Toothbrush Set', 'Biodegradable bamboo toothbrushes with BPA-free bristles. Plastic-free packaging.', 12.99, 200, 'https://images.unsplash.com/photo-1559591935-c6cc0c6c0e6c?w=400', 'home', 'Brush with Bamboo', ARRAY['bamboo', 'bpa-free bristles'], 'China', 0.5, 'A+', NOW(), NOW()),

('Organic Cotton Bedding Set', '100% organic cotton bedding made with GOTS certified cotton. Chemical-free and hypoallergenic.', 89.99, 45, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 'home', 'Coyuchi', ARRAY['organic cotton'], 'India', 4.2, 'A+', NOW(), NOW()),

('Recycled Glass Water Bottle', 'Water bottle made from 100% recycled glass. BPA-free and dishwasher safe.', 28.99, 80, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', 'home', 'BKR', ARRAY['recycled glass', 'silicone'], 'USA', 1.8, 'A+', NOW(), NOW()),

-- A Grade Home
('FSC Certified Wood Cutting Board', 'Cutting board made from FSC certified sustainable wood. Naturally antibacterial.', 45.99, 60, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400', 'home', 'John Boos', ARRAY['fsc certified wood'], 'USA', 8.9, 'A', NOW(), NOW()),

('Beeswax Food Wraps', 'Reusable food wraps made from organic cotton and beeswax. Plastic-free alternative to cling wrap.', 18.99, 150, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400', 'home', 'Bee''s Wrap', ARRAY['organic cotton', 'beeswax'], 'USA', 2.3, 'A', NOW(), NOW());

-- BEAUTY & PERSONAL CARE CATEGORY (A+ to A grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Beauty
('Organic Argan Oil', 'Pure organic argan oil sourced from women''s cooperatives in Morocco. Cold-pressed and unrefined.', 22.99, 90, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 'beauty', 'Josie Maran', ARRAY['organic argan oil'], 'Morocco', 1.5, 'A+', NOW(), NOW()),

('Bamboo Makeup Brushes', 'Makeup brushes with bamboo handles and synthetic bristles. Cruelty-free and biodegradable.', 34.99, 70, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'beauty', 'EcoTools', ARRAY['bamboo', 'synthetic bristles'], 'China', 2.1, 'A+', NOW(), NOW()),

('Natural Deodorant', 'Aluminum-free deodorant made with organic coconut oil and essential oils. Plastic-free packaging.', 14.99, 110, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 'beauty', 'Native', ARRAY['organic coconut oil', 'essential oils'], 'USA', 1.8, 'A+', NOW(), NOW()),

-- A Grade Beauty
('Recycled Plastic Hairbrush', 'Hairbrush made from 100% recycled plastic. BPA-free and designed for all hair types.', 24.99, 85, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'beauty', 'Wet Brush', ARRAY['recycled plastic'], 'USA', 4.2, 'A', NOW(), NOW());

-- ELECTRONICS CATEGORY (B to C grades - electronics inherently have higher impact)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- B Grade Electronics
('Solar-Powered Phone Charger', 'Portable solar charger made with recycled materials. Charges phones using renewable energy.', 89.99, 40, 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400', 'electronics', 'Goal Zero', ARRAY['recycled aluminum', 'solar panels'], 'USA', 45.2, 'B', NOW(), NOW()),

('Energy-Efficient LED Bulbs', 'LED bulbs made with recycled materials. 90% more efficient than traditional bulbs.', 12.99, 200, 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400', 'electronics', 'Philips', ARRAY['recycled plastic', 'led components'], 'Netherlands', 28.7, 'B', NOW(), NOW()),

-- C Grade Electronics
('Refurbished Laptop', 'Certified refurbished laptop with extended warranty. Reduces e-waste and carbon footprint.', 599.99, 25, 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400', 'electronics', 'Apple', ARRAY['recycled aluminum', 'recycled plastic'], 'USA', 156.3, 'C', NOW(), NOW());

-- SPORTS & OUTDOOR CATEGORY (A+ to B grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Sports
('Bamboo Yoga Mat', 'Non-toxic yoga mat made from natural bamboo and cork. Biodegradable and slip-resistant.', 79.99, 55, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'sports', 'Manduka', ARRAY['bamboo', 'cork'], 'Germany', 3.8, 'A+', NOW(), NOW()),

('Recycled Polyester Gym Bag', 'Durable gym bag made from 100% recycled polyester. Water-resistant and eco-friendly.', 45.99, 65, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'sports', 'Adidas', ARRAY['recycled polyester'], 'Vietnam', 12.4, 'A', NOW(), NOW()),

-- B Grade Sports
('Sustainable Tennis Racket', 'Tennis racket made with FSC certified wood and recycled materials. Professional quality.', 189.99, 30, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'sports', 'Wilson', ARRAY['fsc certified wood', 'recycled materials'], 'USA', 34.2, 'B', NOW(), NOW());

-- BOOKS & STATIONERY CATEGORY (A+ to A grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Books
('Recycled Paper Notebook', 'Notebook made from 100% post-consumer recycled paper. Tree-free and chlorine-free.', 8.99, 180, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'books', 'Decomposition', ARRAY['recycled paper'], 'USA', 1.2, 'A+', NOW(), NOW()),

('Bamboo Pen Set', 'Pens made from sustainable bamboo with refillable ink cartridges. Plastic-free design.', 15.99, 95, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'books', 'Bamboo Pen Co', ARRAY['bamboo', 'refillable ink'], 'China', 2.4, 'A+', NOW(), NOW()),

-- A Grade Books
('Eco-Friendly Planner', 'Planner made with recycled materials and soy-based ink. Sustainable organization solution.', 24.99, 75, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'books', 'Passion Planner', ARRAY['recycled paper', 'soy ink'], 'USA', 4.8, 'A', NOW(), NOW());

-- TOYS & GAMES CATEGORY (A+ to A grades)
INSERT INTO products (name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, eco_score, created_at, updated_at) VALUES
-- A+ Grade Toys
('Wooden Building Blocks', 'Educational building blocks made from FSC certified sustainable wood. Non-toxic finishes.', 39.99, 120, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'toys', 'PlanToys', ARRAY['fsc certified wood'], 'Thailand', 3.1, 'A+', NOW(), NOW()),

('Organic Cotton Stuffed Animal', 'Soft stuffed animal made from organic cotton and natural wool stuffing. Safe for babies.', 29.99, 85, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'toys', 'Under the Nile', ARRAY['organic cotton', 'natural wool'], 'Egypt', 2.7, 'A+', NOW(), NOW()),

-- A Grade Toys
('Recycled Plastic Building Set', 'Building set made from 100% recycled plastic. Compatible with major brands.', 49.99, 60, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'toys', 'Green Toys', ARRAY['recycled plastic'], 'USA', 8.9, 'A', NOW(), NOW());

-- Add sustainability data for better eco score calculations
UPDATE products 
SET sustainability_data = CASE 
    WHEN category = 'apparel' AND brand = 'Patagonia' THEN 
        '{"materials":[{"type":"organic_cotton","percentage":100,"isRecycled":false}],"weight_kg":0.2,"manufacturing":{"energySource":"renewable","energyKwh":1.5,"location":"USA"},"transport":[{"mode":"truck","distance_km":200}],"packaging":{"type":"recycled_paper","weight_kg":0.05,"isRecyclable":true},"lifecycle":{"expectedLifespan_years":5,"disposalMethod":"recycling","recyclabilityRate":0.9}}'::jsonb
    WHEN category = 'apparel' AND brand = 'Eileen Fisher' THEN 
        '{"materials":[{"type":"hemp","percentage":100,"isRecycled":false}],"weight_kg":0.3,"manufacturing":{"energySource":"solar","energyKwh":2.0,"location":"USA"},"transport":[{"mode":"train","distance_km":150}],"packaging":{"type":"recycled_paper","weight_kg":0.08,"isRecyclable":true},"lifecycle":{"expectedLifespan_years":8,"disposalMethod":"compost","recyclabilityRate":0.95}}'::jsonb
    WHEN category = 'food' AND brand = 'Ancient Harvest' THEN 
        '{"materials":[{"type":"organic","percentage":100,"isRecycled":false}],"weight_kg":0.5,"manufacturing":{"energySource":"renewable","energyKwh":0.8,"location":"Peru"},"transport":[{"mode":"ship","distance_km":3000}],"packaging":{"type":"recycled_paper","weight_kg":0.1,"isRecyclable":true},"lifecycle":{"expectedLifespan_years":2,"disposalMethod":"compost","recyclabilityRate":0.8}}'::jsonb
    WHEN category = 'home' AND brand = 'Brush with Bamboo' THEN 
        '{"materials":[{"type":"bamboo","percentage":85,"isRecycled":false},{"type":"bpa-free bristles","percentage":15,"isRecycled":false}],"weight_kg":0.02,"manufacturing":{"energySource":"renewable","energyKwh":0.1,"location":"China"},"transport":[{"mode":"ship","distance_km":8000}],"packaging":{"type":"recycled_paper","weight_kg":0.01,"isRecyclable":true},"lifecycle":{"expectedLifespan_years":3,"disposalMethod":"compost","recyclabilityRate":0.9}}'::jsonb
    ELSE sustainability_data
END
WHERE category IN ('apparel', 'food', 'home') AND brand IN ('Patagonia', 'Eileen Fisher', 'Ancient Harvest', 'Brush with Bamboo'); 