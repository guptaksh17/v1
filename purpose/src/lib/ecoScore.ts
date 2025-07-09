import { Product } from './products';
import { calculateProductFootprint, ProductFootprintData } from './sustainability';

// Eco-Score calculation metrics and weights
export const ECO_SCORE_WEIGHTS = {
  CARBON_FOOTPRINT: 0.4,
  MATERIAL_SUSTAINABILITY: 0.25,
  MANUFACTURING_ENERGY: 0.15,
  PACKAGING_TRANSPORT: 0.10,
  END_OF_LIFE: 0.10
} as const;

// Industry benchmarks for carbon footprint (kg CO2e per product)
export const CARBON_BENCHMARKS = {
  CLOTHING: { min: 2, max: 25, avg: 8 },
  ELECTRONICS: { min: 50, max: 200, avg: 100 },
  FOOD: { min: 0.5, max: 10, avg: 3 },
  HOME_GOODS: { min: 5, max: 50, avg: 20 },
  BEAUTY: { min: 1, max: 15, avg: 5 },
  DEFAULT: { min: 1, max: 100, avg: 20 }
} as const;

// Material sustainability scores
export const MATERIAL_SCORES: Record<string, number> = {
  // Textiles
  'organic_cotton': 90,
  'recycled_cotton': 85,
  'hemp': 95,
  'bamboo': 80,
  'linen': 85,
  'wool': 70,
  'silk': 60,
  'conventional_cotton': 30,
  'polyester': 20,
  'recycled_polyester': 75,
  'nylon': 15,
  'acrylic': 10,
  
  // Plastics
  'recycled_plastic': 70,
  'bioplastic': 80,
  'compostable_plastic': 85,
  'virgin_plastic': 10,
  
  // Metals
  'recycled_aluminum': 90,
  'recycled_steel': 85,
  'virgin_aluminum': 40,
  'virgin_steel': 50,
  
  // Wood & Paper
  'fsc_certified_wood': 85,
  'recycled_paper': 90,
  'bamboo_wood': 80,
  'virgin_wood': 60,
  
  // Glass
  'recycled_glass': 85,
  'virgin_glass': 70,
  
  // Food & Beverages
  'organic': 90,
  'fair_trade': 85,
  'local': 80,
  'seasonal': 75,
  'conventional': 30
};

// Manufacturing energy scores
export const MANUFACTURING_SCORES = {
  'renewable': 95,
  'solar': 90,
  'wind': 90,
  'hydro': 85,
  'nuclear': 70,
  'gas': 40,
  'coal': 10,
  'globalAverage': 50
} as const;

// Transport mode scores
export const TRANSPORT_SCORES = {
  'ship': 60,
  'train': 80,
  'truck': 40,
  'plane': 10,
  'van': 50,
  'local': 95
} as const;

// End-of-life scores
export const END_OF_LIFE_SCORES = {
  'recycling': 80,
  'compost': 90,
  'reuse': 95,
  'landfill': 10,
  'incineration': 30
} as const;

export interface EcoScoreFactors {
  carbonFootprint: number; // in kg CO2
  materials: string[];
  manufacturingLocation: string;
  sustainabilityData?: any;
  weightKg?: number;
}

export interface EcoScoreBreakdown {
  total?: number;
  totalScore?: number;
  carbonScore: number;
  materialSustainability?: number;
  manufacturingEnergy?: number;
  packagingTransport?: number;
  endOfLife?: number;
  materialsScore?: number;
  locationScore?: number;
  weightScore?: number;
  breakdown?: {
    carbon: { score: number; maxScore: number; weight: number };
    materials: { score: number; maxScore: number; weight: number };
    location: { score: number; maxScore: number; weight: number };
    weight: { score: number; maxScore: number; weight: number };
  };
  details?: {
    carbonScore: number;
    materialScore: number;
    manufacturingScore: number;
    transportScore: number;
    endOfLifeScore: number;
  };
}

// Sustainable materials with their scores
const SUSTAINABLE_MATERIALS: { [key: string]: number } = {
  // Natural materials (high score)
  'organic cotton': 10,
  'bamboo': 10,
  'hemp': 10,
  'linen': 9,
  'wool': 8,
  'silk': 7,
  'cork': 10,
  'jute': 9,
  'sisal': 9,
  
  // Recycled materials (high score)
  'recycled polyester': 8,
  'recycled cotton': 9,
  'recycled nylon': 7,
  'recycled plastic': 6,
  'recycled paper': 8,
  'recycled glass': 8,
  'recycled metal': 8,
  
  // Biodegradable materials (good score)
  'biodegradable plastic': 6,
  'compostable': 8,
  'plant-based': 7,
  
  // Conventional materials (lower scores)
  'polyester': 3,
  'nylon': 2,
  'acrylic': 2,
  'polyurethane': 2,
  'pvc': 1,
  'leather': 4,
  'synthetic leather': 2,
  
  // Metals (varies by type)
  'aluminum': 5,
  'steel': 4,
  'copper': 6,
  'brass': 5,
  
  // Other
  'cotton': 5,
  'denim': 4,
  'canvas': 6
};

// Manufacturing locations with their scores
const LOCATION_SCORES: { [key: string]: number } = {
  // Local manufacturing (high score)
  'india': 8,
  'local': 10,
  'domestic': 10,
  
  // Countries with good environmental regulations
  'germany': 8,
  'sweden': 9,
  'norway': 9,
  'denmark': 9,
  'finland': 9,
  'switzerland': 8,
  'netherlands': 8,
  'austria': 8,
  'belgium': 7,
  'france': 7,
  'uk': 7,
  'canada': 7,
  'australia': 7,
  'new zealand': 8,
  'japan': 7,
  'south korea': 6,
  
  // Countries with moderate regulations
  'usa': 6,
  'italy': 6,
  'spain': 6,
  'portugal': 6,
  'ireland': 7,
  'poland': 5,
  'czech republic': 5,
  'hungary': 5,
  'slovakia': 5,
  
  // Countries with lower environmental standards
  'china': 3,
  'bangladesh': 2,
  'vietnam': 3,
  'cambodia': 2,
  'myanmar': 2,
  'pakistan': 2,
  'sri lanka': 3,
  'thailand': 4,
  'indonesia': 3,
  'malaysia': 4,
  'philippines': 3,
  'mexico': 4,
  'brazil': 4,
  'turkey': 4,
  'morocco': 3,
  'tunisia': 3,
  'egypt': 3
};

/**
 * Calculate eco score based on various sustainability factors
 * Returns a score from 0.0 to 10.0
 */
export function calculateEcoScore(factors: EcoScoreFactors): EcoScoreBreakdown {
  const weights = {
    carbon: 0.4,    // 40% weight
    materials: 0.3, // 30% weight
    location: 0.2,  // 20% weight
    weight: 0.1     // 10% weight
  };

  // Calculate carbon footprint score (0-10)
  const carbonScore = calculateCarbonScore(factors.carbonFootprint);
  
  // Calculate materials score (0-10)
  const materialsScore = calculateMaterialsScore(factors.materials);
  
  // Calculate location score (0-10)
  const locationScore = calculateLocationScore(factors.manufacturingLocation);
  
  // Calculate weight score (0-10)
  const weightScore = calculateWeightScore(factors.weightKg);
  
  // Calculate weighted total score
  const totalScore = (
    carbonScore * weights.carbon +
    materialsScore * weights.materials +
    locationScore * weights.location +
    weightScore * weights.weight
  );

  return {
    totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal place
    carbonScore,
    materialsScore,
    locationScore,
    weightScore,
    breakdown: {
      carbon: { score: carbonScore, maxScore: 10, weight: weights.carbon },
      materials: { score: materialsScore, maxScore: 10, weight: weights.materials },
      location: { score: locationScore, maxScore: 10, weight: weights.location },
      weight: { score: weightScore, maxScore: 10, weight: weights.weight }
    }
  };
}

function calculateCarbonScore(carbonFootprint: number): number {
  if (!carbonFootprint || carbonFootprint <= 0) return 50; // Neutral score for unknown
  
  // Score based on carbon footprint ranges (0-100 scale)
  if (carbonFootprint <= 50) return 100;   // Excellent
  if (carbonFootprint <= 100) return 90;   // Very good
  if (carbonFootprint <= 200) return 80;   // Good
  if (carbonFootprint <= 300) return 70;   // Above average
  if (carbonFootprint <= 400) return 60;   // Average
  if (carbonFootprint <= 500) return 50;   // Below average
  if (carbonFootprint <= 600) return 40;   // Poor
  if (carbonFootprint <= 700) return 30;   // Very poor
  if (carbonFootprint <= 800) return 20;   // Bad
  return 10; // Very bad
}

function calculateMaterialsScore(materials: string[]): number {
  if (!materials || materials.length === 0) return 5.0; // Neutral score for unknown
  
  let totalScore = 0;
  let validMaterials = 0;
  
  for (const material of materials) {
    const materialLower = material.toLowerCase().trim();
    
    // Check for exact matches
    if (SUSTAINABLE_MATERIALS[materialLower] !== undefined) {
      totalScore += SUSTAINABLE_MATERIALS[materialLower];
      validMaterials++;
      continue;
    }
    
    // Check for partial matches
    let bestMatch = 0;
    for (const [key, score] of Object.entries(SUSTAINABLE_MATERIALS)) {
      if (materialLower.includes(key) || key.includes(materialLower)) {
        bestMatch = Math.max(bestMatch, score);
      }
    }
    
    if (bestMatch > 0) {
      totalScore += bestMatch;
      validMaterials++;
    } else {
      // Unknown material gets neutral score
      totalScore += 5.0;
      validMaterials++;
    }
  }
  
  return validMaterials > 0 ? totalScore / validMaterials : 5.0;
}

function calculateLocationScore(location: string): number {
  if (!location) return 5.0; // Neutral score for unknown
  
  const locationLower = location.toLowerCase().trim();
  
  // Check for exact matches
  if (LOCATION_SCORES[locationLower] !== undefined) {
    return LOCATION_SCORES[locationLower];
  }
  
  // Check for partial matches
  for (const [key, score] of Object.entries(LOCATION_SCORES)) {
    if (locationLower.includes(key) || key.includes(locationLower)) {
      return score;
    }
  }
  
  // Check for keywords
  if (locationLower.includes('local') || locationLower.includes('domestic')) return 9.0;
  if (locationLower.includes('europe') || locationLower.includes('eu')) return 7.0;
  if (locationLower.includes('asia')) return 4.0;
  if (locationLower.includes('africa')) return 4.0;
  if (locationLower.includes('south america')) return 4.0;
  
  return 5.0; // Default neutral score
}

function calculateWeightScore(weightKg?: number): number {
  if (!weightKg || weightKg <= 0) return 5.0; // Neutral score for unknown
  
  // Lighter products generally have lower environmental impact
  if (weightKg <= 0.1) return 10.0;   // Very light
  if (weightKg <= 0.5) return 9.0;    // Light
  if (weightKg <= 1.0) return 8.0;    // Medium-light
  if (weightKg <= 2.0) return 7.0;    // Medium
  if (weightKg <= 5.0) return 6.0;    // Medium-heavy
  if (weightKg <= 10.0) return 5.0;   // Heavy
  if (weightKg <= 20.0) return 4.0;   // Very heavy
  if (weightKg <= 50.0) return 3.0;   // Extremely heavy
  return 2.0; // Very extremely heavy
}

/**
 * Get eco score description based on score
 */
export function getEcoScoreDescription(score: number): string {
  if (score >= 9.0) return "Excellent - Very environmentally friendly";
  if (score >= 8.0) return "Very Good - Highly sustainable";
  if (score >= 7.0) return "Good - Environmentally conscious";
  if (score >= 6.0) return "Above Average - Better than most";
  if (score >= 5.0) return "Average - Moderate environmental impact";
  if (score >= 4.0) return "Below Average - Higher than ideal impact";
  if (score >= 3.0) return "Poor - Significant environmental impact";
  if (score >= 2.0) return "Very Poor - High environmental impact";
  return "Very Bad - Extremely high environmental impact";
}

/**
 * Get eco score color based on score
 */
export function getEcoScoreColor(score: number): string {
  if (score >= 8.0) return "#10B981"; // Green
  if (score >= 6.0) return "#059669"; // Dark green
  if (score >= 4.0) return "#F59E0B"; // Amber
  if (score >= 2.0) return "#EF4444"; // Red
  return "#DC2626"; // Dark red
}

/**
 * Get eco score badge text based on score
 */
export function getEcoScoreBadge(score: number): string {
  if (score >= 9.0) return "🌱 Eco Champion";
  if (score >= 8.0) return "🌿 Green Choice";
  if (score >= 7.0) return "🌍 Sustainable";
  if (score >= 6.0) return "♻️ Eco-Friendly";
  if (score >= 5.0) return "⚖️ Balanced";
  if (score >= 4.0) return "⚠️ Moderate Impact";
  if (score >= 3.0) return "🚨 High Impact";
  if (score >= 2.0) return "💥 Very High Impact";
  return "🔥 Extreme Impact";
}

export interface EcoScoreRating {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  color: string;
  description: string;
  equivalent: string;
}

/**
 * Calculate eco-score for a product based on sustainability data
 */
export function calculateEcoScoreForProduct(product: Product): EcoScoreBreakdown {
  const sustainabilityData = product.sustainability_data;
  
  if (!sustainabilityData) {
    // Fallback calculation using basic product data
    return calculateBasicEcoScore(product);
  }
  
  // 1. Carbon Footprint Score (40%)
  const carbonScore = calculateCarbonScore(product.carbon_footprint || 0);
  
  // 2. Material Sustainability Score (25%)
  const materialScore = calculateMaterialScore(sustainabilityData);
  
  // 3. Manufacturing Energy Score (15%)
  const manufacturingScore = calculateManufacturingScore(sustainabilityData);
  
  // 4. Packaging & Transport Score (10%)
  const transportScore = calculateTransportScore(sustainabilityData);
  
  // 5. End-of-Life Score (10%)
  const endOfLifeScore = calculateEndOfLifeScore(sustainabilityData);
  
  // Calculate weighted total
  const total = Math.round(
    (carbonScore * ECO_SCORE_WEIGHTS.CARBON_FOOTPRINT) +
    (materialScore * ECO_SCORE_WEIGHTS.MATERIAL_SUSTAINABILITY) +
    (manufacturingScore * ECO_SCORE_WEIGHTS.MANUFACTURING_ENERGY) +
    (transportScore * ECO_SCORE_WEIGHTS.PACKAGING_TRANSPORT) +
    (endOfLifeScore * ECO_SCORE_WEIGHTS.END_OF_LIFE)
  );
  
  // Debug logging
  console.log('Eco-Score Calculation for:', product.name);
  console.log('Carbon Score:', carbonScore, 'Weight:', ECO_SCORE_WEIGHTS.CARBON_FOOTPRINT);
  console.log('Material Score:', materialScore, 'Weight:', ECO_SCORE_WEIGHTS.MATERIAL_SUSTAINABILITY);
  console.log('Manufacturing Score:', manufacturingScore, 'Weight:', ECO_SCORE_WEIGHTS.MANUFACTURING_ENERGY);
  console.log('Transport Score:', transportScore, 'Weight:', ECO_SCORE_WEIGHTS.PACKAGING_TRANSPORT);
  console.log('End-of-Life Score:', endOfLifeScore, 'Weight:', ECO_SCORE_WEIGHTS.END_OF_LIFE);
  console.log('Total Score:', total);
  
  return {
    total: Math.max(0, Math.min(100, total)),
    carbonScore,
    materialSustainability: Math.round(materialScore),
    manufacturingEnergy: Math.round(manufacturingScore),
    packagingTransport: Math.round(transportScore),
    endOfLife: Math.round(endOfLifeScore),
    details: {
      carbonScore,
      materialScore,
      manufacturingScore,
      transportScore,
      endOfLifeScore
    }
  };
}

/**
 * Calculate material sustainability score
 */
function calculateMaterialScore(sustainabilityData: ProductFootprintData): number {
  const materials = sustainabilityData.materials || [];
  
  if (materials.length === 0) return 50; // Default score
  
  let totalScore = 0;
  let totalWeight = 0;
  
  console.log('Material calculation - Materials:', materials);
  
  materials.forEach(material => {
    const weight = material.weight_kg || 0;
    const percentage = material.percentage || 0;
    const materialType = material.type?.toLowerCase();
    const variant = material.variant?.toLowerCase();
    
    // Get base material score
    let score = MATERIAL_SCORES[materialType as keyof typeof MATERIAL_SCORES] || 50;
    
    console.log(`Material: ${materialType}, Base Score: ${score}, Variant: ${variant}`);
    
    // Apply variant modifiers
    if (variant === 'organic' && materialType?.includes('cotton')) {
      score = MATERIAL_SCORES.organic_cotton;
    } else if (variant === 'recycled') {
      score = Math.min(100, score + 30);
    } else if (variant === 'virgin') {
      score = Math.max(0, score - 20);
    }
    
    // Apply recycled content bonus
    if (material.isRecycled) {
      score = Math.min(100, score + 25);
    }
    
    // Calculate weighted score based on percentage contribution
    const weightedScore = score * (percentage / 100);
    totalScore += weightedScore;
    totalWeight += (percentage / 100); // Use percentage as weight
    
    console.log(`Final Score: ${score}, Percentage: ${percentage}%, Weighted Score: ${weightedScore}`);
  });
  
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  console.log(`Total Score: ${totalScore}, Total Weight: ${totalWeight}, Final Material Score: ${finalScore}`);
  
  return finalScore;
}

/**
 * Calculate manufacturing energy score
 */
function calculateManufacturingScore(sustainabilityData: ProductFootprintData): number {
  const manufacturing = sustainabilityData.manufacturing;
  const energySource = manufacturing?.energySource || 'globalAverage';
  
  return MANUFACTURING_SCORES[energySource as keyof typeof MANUFACTURING_SCORES] || 50;
}

/**
 * Calculate transport score
 */
function calculateTransportScore(sustainabilityData: ProductFootprintData): number {
  const transport = sustainabilityData.transport || [];
  
  if (transport.length === 0) return 50;
  
  let totalScore = 0;
  let totalDistance = 0;
  
  transport.forEach(leg => {
    const mode = leg.mode;
    const distance = leg.distance_km || 0;
    
    const score = TRANSPORT_SCORES[mode as keyof typeof TRANSPORT_SCORES] || 50;
    totalScore += score * distance;
    totalDistance += distance;
  });
  
  return totalDistance > 0 ? Math.round(totalScore / totalDistance) : 50;
}

/**
 * Calculate end-of-life score
 */
function calculateEndOfLifeScore(sustainabilityData: ProductFootprintData): number {
  const lifecycle = sustainabilityData.lifecycle;
  const disposalMethod = lifecycle?.disposalMethod || 'recycling';
  const recyclabilityRate = lifecycle?.recyclabilityRate || 0.5;
  
  const baseScore = END_OF_LIFE_SCORES[disposalMethod as keyof typeof END_OF_LIFE_SCORES] || 50;
  
  // Adjust score based on recyclability rate
  return Math.round(baseScore * recyclabilityRate);
}

/**
 * Basic eco-score calculation for products without detailed sustainability data
 */
function calculateBasicEcoScore(product: Product): EcoScoreBreakdown {
  // Simple scoring based on available data
  let materialScore = 50;
  let carbonScore = 50;
  
  // Check materials
  if (product.materials) {
    const materialKeywords = product.materials.map(m => m.toLowerCase());
    if (materialKeywords.some(m => m.includes('organic') || m.includes('recycled'))) {
      materialScore = 75;
    } else if (materialKeywords.some(m => m.includes('cotton') || m.includes('natural'))) {
      materialScore = 60;
    }
  }
  
  // Check carbon footprint
  if (product.carbon_footprint) {
    carbonScore = Math.max(0, Math.min(100, 100 - (product.carbon_footprint / 10)));
  }
  
  const total = Math.round(
    (carbonScore * ECO_SCORE_WEIGHTS.CARBON_FOOTPRINT) +
    (materialScore * ECO_SCORE_WEIGHTS.MATERIAL_SUSTAINABILITY) +
    (50 * ECO_SCORE_WEIGHTS.MANUFACTURING_ENERGY) +
    (50 * ECO_SCORE_WEIGHTS.PACKAGING_TRANSPORT) +
    (50 * ECO_SCORE_WEIGHTS.END_OF_LIFE)
  );
  
  return {
    total: Math.max(0, Math.min(100, total)),
    carbonScore,
    materialSustainability: materialScore,
    manufacturingEnergy: 50,
    packagingTransport: 50,
    endOfLife: 50,
    details: {
      carbonScore,
      materialScore,
      manufacturingScore: 50,
      transportScore: 50,
      endOfLifeScore: 50
    }
  };
}

/**
 * Get eco-score rating (grade, color, description)
 */
export function getEcoScoreRating(score: number): EcoScoreRating {
  if (score >= 90) {
    return {
      score,
      grade: 'A+',
      color: '#22c55e',
      description: 'Excellent',
      equivalent: 'Equivalent to planting 10 trees'
    };
  } else if (score >= 80) {
    return {
      score,
      grade: 'A',
      color: '#16a34a',
      description: 'Very Good',
      equivalent: 'Equivalent to planting 7 trees'
    };
  } else if (score >= 70) {
    return {
      score,
      grade: 'B',
      color: '#ca8a04',
      description: 'Good',
      equivalent: 'Equivalent to planting 5 trees'
    };
  } else if (score >= 60) {
    return {
      score,
      grade: 'C',
      color: '#dc2626',
      description: 'Average',
      equivalent: 'Equivalent to planting 3 trees'
    };
  } else if (score >= 50) {
    return {
      score,
      grade: 'D',
      color: '#991b1b',
      description: 'Below Average',
      equivalent: 'Equivalent to planting 1 tree'
    };
  } else if (score >= 40) {
    return {
      score,
      grade: 'E',
      color: '#7f1d1d',
      description: 'Poor',
      equivalent: 'No environmental benefit'
    };
  } else {
    return {
      score,
      grade: 'F',
      color: '#450a0a',
      description: 'Very Poor',
      equivalent: 'High environmental impact'
    };
  }
}

/**
 * Calculate similarity between two products for recommendations
 */
export function calculateProductSimilarity(product1: Product, product2: Product): number {
  const ecoScore1 = calculateEcoScoreForProduct(product1);
  const ecoScore2 = calculateEcoScoreForProduct(product2);
  
  // Eco-score similarity (40% weight)
  const scoreSimilarity = 1 - Math.abs(ecoScore1.total - ecoScore2.total) / 100;
  
  // Category similarity (30% weight)
  const categorySimilarity = product1.category === product2.category ? 1 : 0;
  
  // Price range similarity (20% weight)
  const priceDiff = Math.abs(product1.price - product2.price);
  const maxPrice = Math.max(product1.price, product2.price);
  const priceSimilarity = maxPrice > 0 ? Math.max(0, 1 - (priceDiff / maxPrice)) : 0;
  
  // Material similarity (10% weight)
  const materials1 = new Set(product1.materials?.map(m => m.toLowerCase()) || []);
  const materials2 = new Set(product2.materials?.map(m => m.toLowerCase()) || []);
  const intersection = new Set([...materials1].filter(x => materials2.has(x)));
  const union = new Set([...materials1, ...materials2]);
  const materialSimilarity = union.size > 0 ? intersection.size / union.size : 0;
  
  // Calculate weighted similarity
  const similarity = (
    scoreSimilarity * 0.4 +
    categorySimilarity * 0.3 +
    priceSimilarity * 0.2 +
    materialSimilarity * 0.1
  );
  
  return Math.round(similarity * 100);
}

/**
 * Get eco-friendly product recommendations
 */
export function getEcoRecommendations(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 4
): Product[] {
  // Calculate similarity scores
  const productsWithSimilarity = allProducts
    .filter(p => p.id !== currentProduct.id)
    .map(product => ({
      product,
      similarity: calculateProductSimilarity(currentProduct, product),
      ecoScore: calculateEcoScoreForProduct(product)
    }))
    .sort((a, b) => {
      // Sort by similarity first, then by eco-score
      if (Math.abs(a.similarity - b.similarity) < 10) {
        return b.ecoScore.total - a.ecoScore.total;
      }
      return b.similarity - a.similarity;
    })
    .slice(0, limit)
    .map(item => item.product);
  
  return productsWithSimilarity;
} 