-- High Rated Eco-Friendly Products for Supabase
-- These products are designed to score A+ to B grades in our eco score system

-- Clear existing products (optional - uncomment if you want to start fresh)
-- DELETE FROM products;

-- APPAREL & TEXTILES (High Eco Scores: A+ to A)
INSERT INTO products (id, name, description, price, stock, image, category, brand, materials, manufacturing_location, carbon_footprint, sustainability_data, eco_score, created_at, updated_at) VALUES
-- A+ Grade Products (90-100 eco score)
(
  gen_random_uuid(),
  'Organic Hemp T-Shirt',
  'Premium organic hemp t-shirt, naturally antimicrobial and biodegradable. Made with 100% organic hemp fiber.',
  45.00,
  50,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  'apparel',
  'EcoHemp',
  ARRAY['organic hemp'],
  'Canada',
  3.5,
  '{
    "materials": [
      {
        "type": "hemp",
        "percentage": 100,
        "variant": "organic",
        "isRecycled": false
      }
    ],
    "weight_kg": 0.2,
    "manufacturing": {
      "energySource": "renewable",
      "energyKwh": 1.5,
      "location": "Canada"
    },
    "transport": [
      {
        "mode": "train",
        "distance_km": 200
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.05,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 5,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.95
    }
  }',
  'A+',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Bamboo Yoga Pants',
  'Ultra-soft bamboo yoga pants with 4-way stretch. Bamboo is naturally antibacterial and requires minimal water to grow.',
  65.00,
  30,
  'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
  'apparel',
  'BambooLife',
  ARRAY['bamboo', 'spandex'],
  'Thailand',
  4.2,
  '{
    "materials": [
      {
        "type": "bamboo",
        "percentage": 85,
        "variant": "organic",
        "isRecycled": false
      },
      {
        "type": "spandex",
        "percentage": 15,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.3,
    "manufacturing": {
      "energySource": "solar",
      "energyKwh": 2.0,
      "location": "Thailand"
    },
    "transport": [
      {
        "mode": "ship",
        "distance_km": 8000
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.08,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 4,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.85
    }
  }',
  'A+',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Recycled Cotton Hoodie',
  'Comfortable hoodie made from 100% recycled cotton. Each hoodie saves 700 gallons of water compared to conventional cotton.',
  55.00,
  40,
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
  'apparel',
  'ReNew',
  ARRAY['recycled cotton'],
  'India',
  5.8,
  '{
    "materials": [
      {
        "type": "cotton",
        "percentage": 100,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.4,
    "manufacturing": {
      "energySource": "wind",
      "energyKwh": 2.5,
      "location": "India"
    },
    "transport": [
      {
        "mode": "ship",
        "distance_km": 6000
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.1,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 6,
      "disposalMethod": "recycling",
      "recyclabilityRate": 0.90
    }
  }',
  'A',
  NOW(),
  NOW()
),

-- FOOD & BEVERAGES (High Eco Scores: A+ to A)
(
  gen_random_uuid(),
  'Organic Fair Trade Coffee',
  'Premium organic coffee beans sourced from fair trade certified farms. Shade-grown to preserve biodiversity.',
  18.00,
  100,
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
  'food',
  'EcoBean',
  ARRAY['organic coffee'],
  'Colombia',
  2.1,
  '{
    "materials": [
      {
        "type": "organic",
        "percentage": 100,
        "variant": "organic",
        "isRecycled": false
      }
    ],
    "weight_kg": 0.5,
    "manufacturing": {
      "energySource": "renewable",
      "energyKwh": 0.5,
      "location": "Colombia"
    },
    "transport": [
      {
        "mode": "ship",
        "distance_km": 3000
      }
    ],
    "packaging": {
      "type": "compostable",
      "weight_kg": 0.02,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 1,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.95
    }
  }',
  'A+',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Local Honey',
  'Raw honey from local beekeepers. Supports local biodiversity and reduces transport emissions.',
  12.00,
  75,
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
  'food',
  'LocalHive',
  ARRAY['honey'],
  'Local',
  0.8,
  '{
    "materials": [
      {
        "type": "honey",
        "percentage": 100,
        "variant": "organic",
        "isRecycled": false
      }
    ],
    "weight_kg": 0.5,
    "manufacturing": {
      "energySource": "renewable",
      "energyKwh": 0.1,
      "location": "Local"
    },
    "transport": [
      {
        "mode": "local",
        "distance_km": 50
      }
    ],
    "packaging": {
      "type": "recycled_glass",
      "weight_kg": 0.3,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 2,
      "disposalMethod": "recycling",
      "recyclabilityRate": 0.90
    }
  }',
  'A+',
  NOW(),
  NOW()
),

-- HOME & LIVING (High Eco Scores: A to B)
(
  gen_random_uuid(),
  'Bamboo Cutting Board',
  'Sustainable bamboo cutting board. Bamboo is naturally antibacterial and grows 3x faster than wood.',
  35.00,
  60,
  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
  'home',
  'BambooCraft',
  ARRAY['bamboo'],
  'China',
  6.5,
  '{
    "materials": [
      {
        "type": "bamboo",
        "percentage": 100,
        "variant": "organic",
        "isRecycled": false
      }
    ],
    "weight_kg": 0.8,
    "manufacturing": {
      "energySource": "hydro",
      "energyKwh": 3.0,
      "location": "China"
    },
    "transport": [
      {
        "mode": "ship",
        "distance_km": 10000
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.2,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 10,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.95
    }
  }',
  'A',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Recycled Glass Water Bottle',
  'Elegant water bottle made from 100% recycled glass. Reduces plastic waste and lasts a lifetime.',
  28.00,
  80,
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
  'home',
  'EcoGlass',
  ARRAY['recycled glass'],
  'Germany',
  4.8,
  '{
    "materials": [
      {
        "type": "glass",
        "percentage": 100,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.4,
    "manufacturing": {
      "energySource": "renewable",
      "energyKwh": 2.0,
      "location": "Germany"
    },
    "transport": [
      {
        "mode": "train",
        "distance_km": 500
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.1,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 20,
      "disposalMethod": "recycling",
      "recyclabilityRate": 0.95
    }
  }',
  'A',
  NOW(),
  NOW()
),

-- BEAUTY & PERSONAL CARE (High Eco Scores: A to B)
(
  gen_random_uuid(),
  'Organic Lavender Soap',
  'Handcrafted organic lavender soap made with natural ingredients. No synthetic chemicals or plastic packaging.',
  8.00,
  120,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
  'beauty',
  'PureNature',
  ARRAY['organic oils', 'lavender'],
  'Local',
  1.2,
  '{
    "materials": [
      {
        "type": "organic",
        "percentage": 80,
        "variant": "organic",
        "isRecycled": false
      },
      {
        "type": "lavender",
        "percentage": 20,
        "variant": "organic",
        "isRecycled": false
      }
    ],
    "weight_kg": 0.1,
    "manufacturing": {
      "energySource": "renewable",
      "energyKwh": 0.3,
      "location": "Local"
    },
    "transport": [
      {
        "mode": "local",
        "distance_km": 25
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.02,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 1,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.90
    }
  }',
  'A+',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Bamboo Toothbrush',
  'Biodegradable bamboo toothbrush with charcoal-infused bristles. Plastic-free alternative to conventional toothbrushes.',
  6.00,
  200,
  'https://images.unsplash.com/photo-1559591935-c6c92c6c2b6e?w=400',
  'beauty',
  'BambooBrush',
  ARRAY['bamboo', 'charcoal'],
  'Thailand',
  2.8,
  '{
    "materials": [
      {
        "type": "bamboo",
        "percentage": 85,
        "variant": "organic",
        "isRecycled": false
      },
      {
        "type": "charcoal",
        "percentage": 15,
        "variant": "natural",
        "isRecycled": false
      }
    ],
    "weight_kg": 0.05,
    "manufacturing": {
      "energySource": "solar",
      "energyKwh": 0.5,
      "location": "Thailand"
    },
    "transport": [
      {
        "mode": "ship",
        "distance_km": 8000
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.01,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 0.25,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.95
    }
  }',
  'A',
  NOW(),
  NOW()
),

-- ELECTRONICS (Moderate Eco Scores: B to C - due to manufacturing complexity)
(
  gen_random_uuid(),
  'Solar Power Bank',
  'Portable solar charger made with recycled materials. Charges devices using renewable solar energy.',
  45.00,
  45,
  'https://images.unsplash.com/photo-1609592806598-059cbb0d74c5?w=400',
  'electronics',
  'SolarTech',
  ARRAY['recycled aluminum', 'solar panels'],
  'Germany',
  25.0,
  '{
    "materials": [
      {
        "type": "aluminum",
        "percentage": 60,
        "variant": "recycled",
        "isRecycled": true
      },
      {
        "type": "solar_panels",
        "percentage": 30,
        "variant": "recycled",
        "isRecycled": true
      },
      {
        "type": "plastic",
        "percentage": 10,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.3,
    "manufacturing": {
      "energySource": "renewable",
      "energyKwh": 15.0,
      "location": "Germany"
    },
    "transport": [
      {
        "mode": "train",
        "distance_km": 800
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.2,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 8,
      "disposalMethod": "recycling",
      "recyclabilityRate": 0.85
    }
  }',
  'B',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Energy Efficient LED Bulb',
  'LED bulb made with recycled materials. Uses 90% less energy than traditional incandescent bulbs.',
  12.00,
  150,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
  'electronics',
  'EcoLight',
  ARRAY['recycled glass', 'LED components'],
  'Netherlands',
  8.5,
  '{
    "materials": [
      {
        "type": "glass",
        "percentage": 40,
        "variant": "recycled",
        "isRecycled": true
      },
      {
        "type": "led_components",
        "percentage": 50,
        "variant": "recycled",
        "isRecycled": true
      },
      {
        "type": "plastic",
        "percentage": 10,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.1,
    "manufacturing": {
      "energySource": "wind",
      "energyKwh": 2.0,
      "location": "Netherlands"
    },
    "transport": [
      {
        "mode": "train",
        "distance_km": 300
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.05,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 15,
      "disposalMethod": "recycling",
      "recyclabilityRate": 0.90
    }
  }',
  'B',
  NOW(),
  NOW()
),

-- BOOKS & STATIONERY (High Eco Scores: A to B)
(
  gen_random_uuid(),
  'Recycled Paper Notebook',
  'Premium notebook made from 100% recycled paper. Tree-free alternative to conventional notebooks.',
  15.00,
  90,
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
  'stationery',
  'EcoWrite',
  ARRAY['recycled paper'],
  'Sweden',
  3.2,
  '{
    "materials": [
      {
        "type": "paper",
        "percentage": 100,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.2,
    "manufacturing": {
      "energySource": "hydro",
      "energyKwh": 1.0,
      "location": "Sweden"
    },
    "transport": [
      {
        "mode": "train",
        "distance_km": 400
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.05,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 2,
      "disposalMethod": "recycling",
      "recyclabilityRate": 0.95
    }
  }',
  'A',
  NOW(),
  NOW()
),

(
  gen_random_uuid(),
  'Bamboo Pen',
  'Elegant pen made from sustainable bamboo. Refillable design reduces plastic waste.',
  8.00,
  120,
  'https://images.unsplash.com/photo-1583485088034-697b5bc36b35?w=400',
  'stationery',
  'BambooWrite',
  ARRAY['bamboo', 'refill'],
  'Thailand',
  2.5,
  '{
    "materials": [
      {
        "type": "bamboo",
        "percentage": 80,
        "variant": "organic",
        "isRecycled": false
      },
      {
        "type": "refill",
        "percentage": 20,
        "variant": "recycled",
        "isRecycled": true
      }
    ],
    "weight_kg": 0.05,
    "manufacturing": {
      "energySource": "solar",
      "energyKwh": 0.8,
      "location": "Thailand"
    },
    "transport": [
      {
        "mode": "ship",
        "distance_km": 8000
      }
    ],
    "packaging": {
      "type": "recycled_paper",
      "weight_kg": 0.02,
      "isRecyclable": true
    },
    "lifecycle": {
      "expectedLifespan_years": 5,
      "disposalMethod": "compost",
      "recyclabilityRate": 0.90
    }
  }',
  'A',
  NOW(),
  NOW()
);

-- Update the eco_score column with calculated values
-- Note: The eco_score will be calculated automatically by the application
-- based on the sustainability_data provided above 