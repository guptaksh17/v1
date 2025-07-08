# Eco Score System Setup Guide

## 🌱 What is Eco Score?

The Eco Score is a comprehensive environmental rating system (0.0-10.0) that evaluates products based on multiple sustainability factors:

- **Carbon Footprint** (40% weight) - Based on CO2 emissions
- **Materials** (30% weight) - Sustainability of materials used
- **Manufacturing Location** (20% weight) - Environmental regulations of production country
- **Product Weight** (10% weight) - Lighter products generally have lower impact

## 🗄️ Database Setup

### 1. Add Eco Score Column
Run this SQL in your Supabase SQL Editor:

```sql
-- Add eco_score column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS eco_score DECIMAL(3,1) DEFAULT 0.0;

-- Add comment to explain the eco_score field
COMMENT ON COLUMN products.eco_score IS 'Environmental score from 0.0 to 10.0 based on sustainability factors';

-- Create index for better query performance on eco_score
CREATE INDEX IF NOT EXISTS idx_products_eco_score ON products(eco_score DESC);

-- Add constraint to ensure eco_score is between 0 and 10
ALTER TABLE products 
ADD CONSTRAINT check_eco_score_range 
CHECK (eco_score >= 0.0 AND eco_score <= 10.0);
```

### 2. Update Existing Products
After adding the column, update existing products with calculated scores:

```sql
-- Update existing products with calculated eco_scores
-- This will be done automatically by the application
```

## 🎯 How It Works

### Score Calculation
The system automatically calculates eco scores based on:

1. **Carbon Footprint**: 
   - ≤50kg CO2 = 10.0 (Excellent)
   - ≤100kg CO2 = 9.0 (Very Good)
   - ≤200kg CO2 = 8.0 (Good)
   - And so on...

2. **Materials Scoring**:
   - Organic cotton, bamboo, hemp = 10.0
   - Recycled materials = 6-9.0
   - Conventional materials = 1-5.0

3. **Location Scoring**:
   - India, local manufacturing = 8-10.0
   - European countries = 7-9.0
   - Countries with lower standards = 2-4.0

4. **Weight Scoring**:
   - ≤0.1kg = 10.0 (Very light)
   - ≤0.5kg = 9.0 (Light)
   - And so on...

### Score Ranges
- **9.0-10.0**: 🌱 Eco Champion - Excellent
- **8.0-8.9**: 🌿 Green Choice - Very Good
- **7.0-7.9**: 🌍 Sustainable - Good
- **6.0-6.9**: ♻️ Eco-Friendly - Above Average
- **5.0-5.9**: ⚖️ Balanced - Average
- **4.0-4.9**: ⚠️ Moderate Impact - Below Average
- **3.0-3.9**: 🚨 High Impact - Poor
- **2.0-2.9**: 💥 Very High Impact - Very Poor
- **0.0-1.9**: 🔥 Extreme Impact - Very Bad

## 🚀 Usage

### In Components
```tsx
import EcoScoreBadge from '@/components/EcoScoreBadge';

// Basic usage
<EcoScoreBadge product={product} />

// With options
<EcoScoreBadge 
  product={product} 
  size="lg" 
  showDescription={true} 
/>
```

### Programmatic Calculation
```tsx
import { calculateEcoScore } from '@/lib/productEcoScore';

const ecoScore = calculateEcoScore({
  carbonFootprint: 150,
  materials: ['organic cotton', 'recycled polyester'],
  manufacturingLocation: 'India',
  weightKg: 0.5
});

console.log(ecoScore.totalScore); // e.g., 8.2
```

## 🎨 Visual Features

### Color Coding
- **Green** (#10B981): 8.0+ (Excellent/Good)
- **Dark Green** (#059669): 6.0-7.9 (Above Average)
- **Amber** (#F59E0B): 4.0-5.9 (Average/Below Average)
- **Red** (#EF4444): 2.0-3.9 (Poor)
- **Dark Red** (#DC2626): 0.0-1.9 (Very Bad)

### Badge Display
The EcoScoreBadge component displays:
- Score number (e.g., "8.2")
- Badge text (e.g., "🌿 Green Choice")
- Optional description
- Color-coded background and border

## 📊 Benefits

### For Users
- **Transparent Information**: Clear environmental impact ratings
- **Informed Decisions**: Easy comparison of product sustainability
- **Trust Building**: Verified environmental claims

### For Business
- **Competitive Advantage**: Highlight sustainable products
- **Customer Loyalty**: Appeal to environmentally conscious consumers
- **Data Insights**: Track sustainability performance

## 🔧 Customization

### Adjusting Weights
Modify the weights in `src/lib/productEcoScore.ts`:

```typescript
const weights = {
  carbon: 0.4,    // 40% weight
  materials: 0.3, // 30% weight
  location: 0.2,  // 20% weight
  weight: 0.1     // 10% weight
};
```

### Adding New Materials
Add new materials to the `SUSTAINABLE_MATERIALS` object:

```typescript
const SUSTAINABLE_MATERIALS: { [key: string]: number } = {
  'new-material': 8.0, // Add your material here
  // ... existing materials
};
```

### Custom Scoring Logic
Modify the calculation functions to match your specific requirements.

## ✅ Next Steps

1. **Run the database migration** to add the eco_score column
2. **Test the calculation** with existing products
3. **Add EcoScoreBadge** to product cards and detail pages
4. **Monitor and adjust** scoring based on feedback

The eco score system is now ready to provide valuable environmental insights to your customers! 