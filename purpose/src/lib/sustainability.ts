// Emission factors (in kg CO2e per unit)
// Sources: Various LCA databases and research papers
export const EMISSION_FACTORS = {
  // Material production (per kg)
  materials: {
    // Textiles
    cotton: { 
      conventional: 5.5,    // kg CO2e per kg
      organic: 2.5,        // ~55% less than conventional
      recycled: 1.5        // ~73% less than conventional
    },
    polyester: {
      virgin: 7.2,         // kg CO2e per kg
      recycled: 2.1        // ~71% less than virgin
    },
    wool: {
      conventional: 12.0,
      organic: 8.0,
      recycled: 3.6
    },
    // Add more materials as needed
    silk: 27.0,
    linen: 2.1,
    hemp: 2.15,
    // Plastics
    plastic: {
      pet: 3.2,
      pp: 2.7,
      ps: 3.4,
      pvc: 3.4,
      recycled: 1.5
    },
    // Metals
    metal: {
      aluminum: {
        primary: 8.24,
        recycled: 0.82
      },
      steel: {
        primary: 1.9,
        recycled: 0.7
      }
    },
    // Paper and wood
    paper: {
      virgin: 1.0,
      recycled: 0.7
    },
    wood: 0.5,
    // Glass
    glass: {
      container: 0.85,
      flat: 1.0,
      recycled: 0.6
    },
    // Add more materials as needed
  },
  
  // Transportation (kg CO2e per tonne-km)
  transport: {
    ship: 0.01,         // Ocean freight
    truck: 0.1,         // 32+ ton truck
    train: 0.03,        // Rail freight
    plane: 0.8,         // Air freight
    van: 0.3,           // Light commercial vehicle
    car: 0.2            // Average car
  },
  
  // Energy (kg CO2e per kWh)
  energy: {
    // Regional electricity grids
    grid: {
      globalAverage: 0.475,
      europe: 0.276,
      northAmerica: 0.389,
      asia: 0.517,
      china: 0.583,
      india: 0.708,
      uk: 0.233,
      germany: 0.364,
      france: 0.068,  // Mostly nuclear
      us: 0.386,
      canada: 0.13
    },
    // Renewable energy sources
    renewable: 0.05,    // Average for wind/solar mix
    wind: 0.011,
    solar: 0.048,
    hydro: 0.024,
    nuclear: 0.012,
    // Fossil fuels
    coal: 0.96,
    gas: 0.469,
    oil: 0.79
  },
  
  // End of life (kg CO2e per kg material)
  disposal: {
    landfill: 0.1,      // Decomposition emissions
    incineration: 0.5,  // With energy recovery
    recycling: -0.1,    // Negative = emissions saved
    composting: 0.02,
    reuse: -1.0         // Significant savings for reuse
  }
} as const;

// Types for our enhanced calculation
export type MaterialType = keyof typeof EMISSION_FACTORS.materials;
export type TransportMode = keyof typeof EMISSION_FACTORS.transport;
export type EnergySource = keyof typeof EMISSION_FACTORS.energy.grid | keyof Omit<typeof EMISSION_FACTORS, 'grid' | 'transport' | 'materials' | 'disposal'>;
export type DisposalMethod = keyof typeof EMISSION_FACTORS.disposal;

export interface MaterialComposition {
  type: string;
  percentage: number;
  weight_kg?: number;
  isRecycled?: boolean;
  variant?: string; // e.g., 'organic', 'recycled', 'virgin'
}

export interface TransportLeg {
  mode: TransportMode;
  distance_km: number;
  weight_kg?: number; // Optional override for this leg
}

export interface ManufacturingData {
  energySource: EnergySource;
  energyKwh: number;
  location?: string; // For regional energy mix
  processEfficiency?: number; // 0-1, default 1
}

export interface PackagingData {
  type: string;
  weight_kg: number;
  isRecyclable: boolean;
  isRecycled?: boolean;
  transport?: TransportLeg[]; // Transport specific to packaging
}

export interface LifecycleData {
  expectedLifespan_years: number;
  usePhaseImpact?: number; // Additional impact from use (e.g., washing, charging)
  disposalMethod: DisposalMethod;
  recyclabilityRate?: number; // 0-1, what percentage is actually recycled
}

export interface ProductFootprintData {
  // Core product info
  weight_kg: number;
  
  // Detailed composition
  materials: MaterialComposition[];
  
  // Manufacturing
  manufacturing: ManufacturingData;
  
  // Transport
  transport: TransportLeg[];
  
  // Packaging
  packaging: PackagingData;
  
  // Lifecycle
  lifecycle: LifecycleData;
  
  // Optional overrides
  customFactors?: {
    material?: Record<string, number>; // Override specific material factors
    transport?: Record<TransportMode, number>;
    energy?: Record<string, number>;
  };
}

/**
 * Calculates the carbon footprint of a product based on detailed lifecycle data
 */
export function calculateProductFootprint(data: ProductFootprintData): {
  total: number;
  breakdown: {
    materials: number;
    transport: number;
    manufacturing: number;
    packaging: number;
    usePhase: number;
    endOfLife: number;
  };
  details: {
    materialBreakdown: Record<string, number>;
    transportBreakdown: Record<TransportMode, number>;
  };
} {
  // Initialize results
  const result = {
    total: 0,
    breakdown: {
      materials: 0,
      transport: 0,
      manufacturing: 0,
      packaging: 0,
      usePhase: 0,
      endOfLife: 0,
    },
    details: {
      materialBreakdown: {},
      transportBreakdown: {} as Record<TransportMode, number>,
    },
  };

  // Helper to get emission factor with overrides
  const getEmissionFactor = (category: 'materials' | 'transport' | 'energy' | 'disposal', key: string, subKey?: string): number => {
    // Check for custom factors first
    if (category === 'materials' && data.customFactors?.material?.[key]) {
      return data.customFactors.material[key];
    }
    if (category === 'transport' && data.customFactors?.transport?.[key as TransportMode]) {
      return data.customFactors.transport[key as TransportMode];
    }
    if (category === 'energy' && data.customFactors?.energy?.[key]) {
      return data.customFactors.energy[key];
    }
    
    // Fall back to default factors
    const factors = EMISSION_FACTORS[category];
    if (!factors) return 0;
    
    // Handle nested properties (e.g., materials.cotton.conventional)
    if (subKey && factors[key] && typeof factors[key] === 'object') {
      return (factors[key] as any)[subKey] || 0;
    }
    
    return (factors as any)[key] || 0;
  };

  // 1. Material emissions
  result.breakdown.materials = data.materials.reduce((sum, mat) => {
    const baseFactor = getEmissionFactor('materials', mat.type, mat.variant);
    const recycledFactor = mat.isRecycled ? 0.3 : 1; // 70% reduction for recycled materials
    const weight = mat.weight_kg || (data.weight_kg * (mat.percentage / 100));
    const emission = weight * baseFactor * recycledFactor;
    
    // Track material breakdown
    const matKey = `${mat.type}${mat.variant ? ` (${mat.variant})` : ''}${mat.isRecycled ? ' (recycled)' : ''}`;
    result.details.materialBreakdown[matKey] = (result.details.materialBreakdown[matKey] || 0) + emission;
    
    return sum + emission;
  }, 0);

  // 2. Transport emissions
  result.breakdown.transport = data.transport.reduce((sum, leg) => {
    const factor = getEmissionFactor('transport', leg.mode);
    const weight = leg.weight_kg || data.weight_kg;
    const emission = weight * factor * leg.distance_km / 1000; // Convert to tonne-km
    
    // Track transport breakdown
    result.details.transportBreakdown[leg.mode] = (result.details.transportBreakdown[leg.mode] || 0) + emission;
    
    return sum + emission;
  }, 0);

  // 3. Manufacturing energy
  const energyFactor = getEmissionFactor('energy', data.manufacturing.energySource);
  const efficiency = data.manufacturing.processEfficiency || 1;
  result.breakdown.manufacturing = data.manufacturing.energyKwh * energyFactor / efficiency;

  // 4. Packaging
  const packagingFactor = getEmissionFactor('materials', data.packaging.type);
  const packagingRecycledFactor = data.packaging.isRecycled ? 0.3 : 1;
  result.breakdown.packaging = data.packaging.weight_kg * packagingFactor * packagingRecycledFactor;
  
  // Add packaging transport if specified
  if (data.packaging.transport) {
    const packagingTransport = data.packaging.transport.reduce((sum, leg) => {
      const factor = getEmissionFactor('transport', leg.mode);
      const weight = leg.weight_kg || data.packaging.weight_kg;
      return sum + (weight * factor * leg.distance_km / 1000);
    }, 0);
    result.breakdown.packaging += packagingTransport;
  }

  // 5. Use phase (if applicable)
  if (data.lifecycle.usePhaseImpact) {
    result.breakdown.usePhase = data.lifecycle.usePhaseImpact / data.lifecycle.expectedLifespan_years;
  }

  // 6. End of life
  const disposalFactor = getEmissionFactor('disposal', data.lifecycle.disposalMethod);
  const recyclability = data.lifecycle.recyclabilityRate || 0.5; // Default 50% recyclability
  
  // Calculate disposal emissions (negative for recycling/reuse)
  if (data.lifecycle.disposalMethod === 'recycling') {
    // Recycling saves emissions compared to virgin material
    const recyclingSavings = data.weight_kg * recyclability * Math.abs(disposalFactor);
    result.breakdown.endOfLife = -recyclingSavings;
  } else {
    // Other disposal methods (landfill, incineration) have positive emissions
    result.breakdown.endOfLife = data.weight_kg * disposalFactor * (1 - recyclability);
  }

  // Calculate total
  result.total = Object.values(result.breakdown).reduce((sum, val) => sum + val, 0);
  
  // Ensure total is not negative (can happen with high recycling rates)
  result.total = Math.max(0, result.total);

  return result;
}

/**
 * Gets a human-readable description of the carbon footprint
 */
export function getFootprintDescription(footprintKg: number): {
  label: string;
  description: string;
  equivalent: string;
} {
  // Equivalent to km driven by an average car (0.12 kg CO2e per km)
  const kmDriven = Math.round(footprintKg / 0.12);
  
  // Equivalent to charging a smartphone (0.08 kg CO2e per charge)
  const phoneCharges = Math.round(footprintKg / 0.08);
  
  // Equivalent to watching TV (0.05 kg CO2e per hour)
  const tvHours = Math.round(footprintKg / 0.05);

  if (footprintKg < 0.1) {
    return {
      label: 'Negligible',
      description: 'Minimal environmental impact',
      equivalent: `Equivalent to charging a smartphone ~${phoneCharges} times`
    };
  } else if (footprintKg < 1) {
    return {
      label: 'Very Low',
      description: 'Very low environmental impact',
      equivalent: `Equivalent to charging a smartphone ~${phoneCharges} times`
    };
  } else if (footprintKg < 5) {
    return {
      label: 'Low',
      description: 'Low environmental impact',
      equivalent: `Equivalent to driving ~${kmDriven} km in a car`
    };
  } else if (footprintKg < 20) {
    return {
      label: 'Moderate',
      description: 'Moderate environmental impact',
      equivalent: `Equivalent to driving ~${kmDriven} km in a car`
    };
  } else if (footprintKg < 100) {
    return {
      label: 'High',
      description: 'High environmental impact',
      equivalent: `Equivalent to driving ~${kmDriven} km in a car`
    };
  } else {
    return {
      label: 'Very High',
      description: 'Very high environmental impact',
      equivalent: `Equivalent to ${(footprintKg / 0.8).toFixed(0)} km of air travel`
    };
  }
}

/**
 * Gets a sustainability rating (1-5 stars) based on the carbon footprint
 */
export function getSustainabilityRating(footprintKg: number, category?: string): {
  stars: number;
  label: string;
} {
  // Category-specific thresholds (kg CO2e)
  const thresholds = {
    clothing: { 5: 2, 4: 5, 3: 10, 2: 20, 1: 50 },
    electronics: { 5: 10, 4: 25, 3: 50, 2: 100, 1: 200 },
    furniture: { 5: 20, 4: 50, 3: 100, 2: 200, 1: 500 },
    food: { 5: 0.5, 4: 1, 3: 2, 2: 5, 1: 10 },
    default: { 5: 1, 4: 5, 3: 10, 2: 20, 1: 50 }
  };

  const categoryThresholds = category && thresholds[category as keyof typeof thresholds] 
    ? thresholds[category as keyof typeof thresholds] 
    : thresholds.default;

  let stars = 0;
  if (footprintKg <= categoryThresholds[5]) stars = 5;
  else if (footprintKg <= categoryThresholds[4]) stars = 4;
  else if (footprintKg <= categoryThresholds[3]) stars = 3;
  else if (footprintKg <= categoryThresholds[2]) stars = 2;
  else if (footprintKg <= categoryThresholds[1]) stars = 1;

  const labels = {
    5: 'Excellent',
    4: 'Very Good',
    3: 'Good',
    2: 'Fair',
    1: 'Poor',
    0: 'Very Poor'
  };

  return {
    stars,
    label: labels[stars as keyof typeof labels] || 'Unknown'
  };
}
