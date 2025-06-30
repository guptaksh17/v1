import { Product } from './products';

// Emission factors (in kg CO2e per unit)
const EMISSION_FACTORS = {
  // Material production (per kg)
  materials: {
    cotton: 5.5,         // kg CO2e per kg of cotton
    polyester: 7.2,      // kg CO2e per kg of polyester
    wool: 12.0,         // kg CO2e per kg of wool
    leather: 17.0,      // kg CO2e per kg of leather
    plastic: 6.0,       // kg CO2e per kg of plastic
    metal: 2.0,         // kg CO2e per kg of metal (average)
    paper: 1.0,         // kg CO2e per kg of paper
    glass: 0.85,        // kg CO2e per kg of glass
  },
  
  // Transportation (per kg per km)
  transport: {
    ship: 0.00001,     // kg CO2e per kg per km
    truck: 0.0001,     // kg CO2e per kg per km
    train: 0.00003,    // kg CO2e per kg per km
    plane: 0.0008,     // kg CO2e per kg per km
  },
  
  // Energy (per kWh)
  energy: {
    // Source: https://www.iea.org/reports/global-energy-co2-status-report-2019/emissions
    globalAverage: 0.475,  // kg CO2e per kWh (global average)
    renewable: 0.05,      // kg CO2e per kWh (renewable)
  },
};

// Default distances (in km) if not provided
const DEFAULT_DISTANCES = {
  materialTransport: 1000,  // km
  productTransport: 500,   // km
};

interface CarbonFootprintOptions {
  weightKg?: number;           // Product weight in kg
  materials: Record<string, number>; // Material composition: { material: percentage (0-100) }
  originCountry?: string;      // Country of origin
  destinationCountry?: string; // Destination country
  transportMode?: keyof typeof EMISSION_FACTORS.transport;
  energySource?: 'globalAverage' | 'renewable';
  manufacturingEnergyKwh?: number; // Energy used in manufacturing (kWh)
  packagingWeightKg?: number;     // Packaging weight in kg
}

export function calculateProductFootprint(
  options: CarbonFootprintOptions
): number {
  const {
    weightKg = 1,  // Default to 1kg if not specified
    materials,
    transportMode = 'truck',
    energySource = 'globalAverage',
    manufacturingEnergyKwh = 0,
    packagingWeightKg = 0,
  } = options;

  // 1. Material production emissions
  const materialEmissions = Object.entries(materials).reduce((sum, [material, percentage]) => {
    const factor = EMISSION_FACTORS.materials[material as keyof typeof EMISSION_FACTORS.materials] || 0;
    return sum + (weightKg * (percentage / 100) * factor);
  }, 0);

  // 2. Transportation emissions
  const transportFactor = EMISSION_FACTORS.transport[transportMode] || 0;
  const transportEmissions = weightKg * transportFactor * DEFAULT_DISTANCES.productTransport;

  // 3. Manufacturing energy emissions
  const energyEmissions = manufacturingEnergyKwh * EMISSION_FACTORS.energy[energySource];

  // 4. Packaging emissions (simplified)
  const packagingEmissions = packagingWeightKg * EMISSION_FACTORS.materials.paper; // Assuming paper packaging

  // Total carbon footprint in kg CO2e
  const totalFootprint = materialEmissions + transportEmissions + energyEmissions + packagingEmissions;

  return parseFloat(totalFootprint.toFixed(2)); // Return with 2 decimal places
}

// Helper function to get a description of the carbon footprint
export function getFootprintDescription(footprintKg: number): {
  label: string;
  description: string;
  equivalent: string;
} {
  // Equivalent to km driven by an average car (0.12 kg CO2e per km)
  const kmDriven = Math.round(footprintKg / 0.12);
  
  // Equivalent to charging a smartphone (0.08 kg CO2e per charge)
  const phoneCharges = Math.round(footprintKg / 0.08);

  if (footprintKg < 1) {
    return {
      label: 'Very Low',
      description: 'Minimal environmental impact',
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
      label: 'Medium',
      description: 'Moderate environmental impact',
      equivalent: `Equivalent to driving ~${kmDriven} km in a car`
    };
  } else {
    return {
      label: 'High',
      description: 'High environmental impact',
      equivalent: `Equivalent to driving ~${kmDriven} km in a car`
    };
  }
}

// Function to calculate and update carbon footprint for a product
export async function calculateAndUpdateCarbonFootprint(product: Product) {
  // Skip if already calculated
  if (product.carbon_footprint) return product.carbon_footprint;

  // Example calculation - adjust based on available product data
  const footprint = calculateProductFootprint({
    weightKg: product.weight_kg || 1,
    materials: {
      // This is a simplified example - you'd want to get these from your product data
      cotton: 50,
      polyester: 30,
      other: 20
    },
    transportMode: 'truck',
    energySource: 'globalAverage',
    manufacturingEnergyKwh: 5, // Example value
    packagingWeightKg: 0.1,    // Example value
  });

  // In a real app, you would update this in your database
  // For example, using Supabase:
  // const { data, error } = await supabase
  //   .from('products')
  //   .update({ carbon_footprint: footprint })
  //   .eq('id', product.id);

  return footprint;
}
