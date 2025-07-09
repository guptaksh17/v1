export interface EcoScoreFactors {
  carbonFootprint: number; // in kg CO2
  materials: string[];
  manufacturingLocation: string;
  sustainabilityData?: any;
  weightKg?: number;
}

export interface EcoScoreBreakdown {
  totalScore: number;
  carbonScore: number;
  materialsScore: number;
  locationScore: number;
  weightScore: number;
  breakdown: {
    carbon: { score: number; maxScore: number; weight: number };
    materials: { score: number; maxScore: number; weight: number };
    location: { score: number; maxScore: number; weight: number };
    weight: { score: number; maxScore: number; weight: number };
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
  if (!carbonFootprint || carbonFootprint <= 0) return 5.0; // Neutral score for unknown
  
  // Score based on carbon footprint ranges
  if (carbonFootprint <= 50) return 10.0;   // Excellent
  if (carbonFootprint <= 100) return 9.0;   // Very good
  if (carbonFootprint <= 200) return 8.0;   // Good
  if (carbonFootprint <= 300) return 7.0;   // Above average
  if (carbonFootprint <= 400) return 6.0;   // Average
  if (carbonFootprint <= 500) return 5.0;   // Below average
  if (carbonFootprint <= 600) return 4.0;   // Poor
  if (carbonFootprint <= 700) return 3.0;   // Very poor
  if (carbonFootprint <= 800) return 2.0;   // Bad
  return 1.0; // Very bad
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
  return "�� Extreme Impact";
} 