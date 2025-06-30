import { supabase } from '@/integrations/supabase/client';
import { 
  MaterialComposition, 
  TransportLeg, 
  ManufacturingData, 
  PackagingData, 
  LifecycleData,
  calculateProductFootprint,
  getFootprintDescription,
  getSustainabilityRating
} from './sustainability';

export interface Product {
  // Core product info
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  brand: string;
  
  // Basic material info (legacy)
  materials: string[];
  manufacturing_location: string | null;
  expiration_date?: string | null;
  
  // Carbon footprint data
  carbon_footprint?: number | null;  // in kg CO2e
  carbon_footprint_breakdown?: {
    materials: number;
    transport: number;
    manufacturing: number;
    packaging: number;
    usePhase: number;
    endOfLife: number;
  };
  
  // Enhanced sustainability data
  sustainability_data?: {
    // Detailed composition
    materials: MaterialComposition[];
    weight_kg: number;
    
    // Manufacturing
    manufacturing: ManufacturingData;
    
    // Transport
    transport: TransportLeg[];
    
    // Packaging
    packaging: PackagingData;
    
    // Lifecycle
    lifecycle: LifecycleData;
    
    // Calculation metadata
    calculated_at?: string;
    calculation_method?: string;
    data_sources?: string[];
    verified_by?: string;
    verification_date?: string;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Process products to ensure they have the correct structure
  return (data || []).map(processProductData);
}

/**
 * Processes raw product data to ensure it has the correct structure
 */
function processProductData(product: any): Product {
  // If no sustainability data exists, create a basic structure
  if (!product.sustainability_data) {
    // Try to extract basic info from legacy fields
    const weight = product.weight_kg || 1;
    const materials = (product.materials || []).map((mat: string) => ({
      type: mat,
      percentage: 100 / (product.materials?.length || 1),
      isRecycled: false
    }));
    
    product.sustainability_data = {
      materials,
      weight_kg: weight,
      manufacturing: {
        energySource: 'globalAverage',
        energyKwh: 2,
        location: product.manufacturing_location || 'Global'
      },
      transport: [{
        mode: 'truck',
        distance_km: 500
      }],
      packaging: {
        type: 'paper',
        weight_kg: 0.1,
        isRecyclable: true
      },
      lifecycle: {
        expectedLifespan_years: 1,
        disposalMethod: 'recycling',
        recyclabilityRate: 0.5
      }
    };
    
    // Calculate footprint if not exists
    if (product.carbon_footprint === undefined || product.carbon_footprint === null) {
      const footprint = calculateProductFootprint(product.sustainability_data);
      product.carbon_footprint = footprint.total;
      product.carbon_footprint_breakdown = footprint.breakdown;
    }
  }
  
  return product as Product;
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
  try {
    // Process product data before saving
    const processedProduct: any = { ...product };
    // Ensure supplier_id is present and correct type
    if (!('supplier_id' in processedProduct)) processedProduct.supplier_id = null;
    // Ensure weight_kg is present if needed
    if (!('weight_kg' in processedProduct)) processedProduct.weight_kg = null;
    
    // Validate supplier_id as UUID
    const isValidUUID = (str: any) =>
      typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isValidUUID(processedProduct.supplier_id)) {
      processedProduct.supplier_id = null;
    }
    
    // If no sustainability data, create default
    if (!processedProduct.sustainability_data) {
      const weight = processedProduct.weight_kg || 1;
      const materials = (processedProduct.materials || ['cotton', 'polyester']).map(mat => ({
        type: mat,
        percentage: 100 / (processedProduct.materials?.length || 2),
        isRecycled: false
      }));
      
      processedProduct.sustainability_data = {
        materials,
        weight_kg: weight,
        manufacturing: {
          energySource: 'globalAverage',
          energyKwh: 2,
          location: processedProduct.manufacturing_location || 'Global'
        },
        transport: [{
          mode: 'truck',
          distance_km: 500
        }],
        packaging: {
          type: 'paper',
          weight_kg: 0.1,
          isRecyclable: true
        },
        lifecycle: {
          expectedLifespan_years: 1,
          disposalMethod: 'recycling',
          recyclabilityRate: 0.5
        },
        calculated_at: new Date().toISOString(),
        calculation_method: 'default',
        data_sources: ['Industry averages']
      };
    }
    
    // Calculate footprint if not provided
    if (processedProduct.carbon_footprint === undefined || processedProduct.carbon_footprint === null) {
      if (
        processedProduct.sustainability_data &&
        typeof processedProduct.sustainability_data === 'object' &&
        !Array.isArray(processedProduct.sustainability_data) &&
        'materials' in processedProduct.sustainability_data &&
        'weight_kg' in processedProduct.sustainability_data &&
        'manufacturing' in processedProduct.sustainability_data &&
        'transport' in processedProduct.sustainability_data &&
        'packaging' in processedProduct.sustainability_data &&
        'lifecycle' in processedProduct.sustainability_data
      ) {
        const footprint = calculateProductFootprint(processedProduct.sustainability_data);
        processedProduct.carbon_footprint = footprint.total;
        processedProduct.carbon_footprint_breakdown = footprint.breakdown;
      }
    }
    
    // Save to database
    const { data: savedProduct, error } = await supabase
      .from('products')
      .insert([processedProduct])
      .select()
      .single();

    if (error) throw error;
    
    return processProductData(savedProduct);
    
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
}

/**
 * Updates a product's carbon footprint based on its current data
 */
export async function updateProductFootprint(productId: string): Promise<{
  success: boolean;
  footprint?: number;
  breakdown?: any;
  error?: string;
}> {
  try {
    // Get current product data
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
      
    if (fetchError || !product) {
      throw new Error(fetchError?.message || 'Product not found');
    }
    
    if (!product.sustainability_data) {
      throw new Error('Product is missing sustainability data');
    }
    
    // Calculate new footprint
    let footprint = { total: 0, breakdown: { materials: 0, transport: 0, manufacturing: 0, packaging: 0, usePhase: 0, endOfLife: 0 }, details: {} };
    if (
      product.sustainability_data &&
      typeof product.sustainability_data === 'object' &&
      !Array.isArray(product.sustainability_data) &&
      'materials' in product.sustainability_data &&
      'weight_kg' in product.sustainability_data &&
      'manufacturing' in product.sustainability_data &&
      'transport' in product.sustainability_data &&
      'packaging' in product.sustainability_data &&
      'lifecycle' in product.sustainability_data
    ) {
      footprint = calculateProductFootprint(product.sustainability_data);
    }
    
    // Update product with new footprint
    let updateObj: any = {
      carbon_footprint: footprint.total,
      carbon_footprint_breakdown: footprint.breakdown,
      updated_at: new Date().toISOString(),
    };
    if (
      product.sustainability_data &&
      typeof product.sustainability_data === 'object' &&
      !Array.isArray(product.sustainability_data) &&
      'materials' in product.sustainability_data &&
      'weight_kg' in product.sustainability_data &&
      'manufacturing' in product.sustainability_data &&
      'transport' in product.sustainability_data &&
      'packaging' in product.sustainability_data &&
      'lifecycle' in product.sustainability_data
    ) {
      updateObj.sustainability_data = {
        ...product.sustainability_data,
        calculated_at: new Date().toISOString()
      };
    }
    const { error: updateError } = await supabase
      .from('products')
      .update(updateObj)
      .eq('id', productId);
      
    if (updateError) throw updateError;
    
    return {
      success: true,
      footprint: footprint.total,
      breakdown: footprint.breakdown
    };
    
  } catch (error) {
    console.error('Error updating product footprint:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
