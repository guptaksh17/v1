import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Leaf,
  Info,
  Plus,
  ChevronsUpDown
} from 'lucide-react';
import { calculateProductFootprint, ProductFootprintData } from '@/lib/sustainability';
import { addProduct as supabaseAddProduct, Product, fetchProducts } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import InventoryManager from '@/components/InventoryManager';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem,
  CommandList
} from '@/components/ui/command';

// Types
type BrandAttribute = {
  value: string;
  label: string;
};

type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
  brand_attributes: string[];
  sustainability_data?: ProductFootprintData;
  supplier_id: string | null;
};

// Define variant options for different material categories
const VARIANT_OPTIONS = {
  // Textiles & Fabrics
  textiles: [
    { value: 'conventional', label: 'Conventional' },
    { value: 'organic', label: 'Organic' },
    { value: 'recycled', label: 'Recycled' },
    { value: 'recycled_content', label: 'Recycled Content' },
    { value: 'gots_certified', label: 'GOTS Certified' },
    { value: 'bluesign', label: 'Bluesign' },
    { value: 'fair_trade', label: 'Fair Trade' },
  ],
  // Leather & Alternatives
  leather: [
    { value: 'conventional', label: 'Conventional' },
    { value: 'vegetable_tanned', label: 'Vegetable Tanned' },
    { value: 'chromium_free', label: 'Chromium Free' },
    { value: 'recycled', label: 'Recycled' },
    { value: 'vegan', label: 'Vegan' },
  ],
  // Plastics & Polymers
  plastics: [
    { value: 'virgin', label: 'Virgin' },
    { value: 'recycled', label: 'Recycled' },
    { value: 'biodegradable', label: 'Biodegradable' },
    { value: 'compostable', label: 'Compostable' },
    { value: 'ocean_plastic', label: 'Ocean Plastic' },
  ],
  // Metals
  metals: [
    { value: 'virgin', label: 'Virgin' },
    { value: 'recycled', label: 'Recycled' },
    { value: 'recycled_content', label: 'Recycled Content' },
    { value: 'conflict_free', label: 'Conflict Free' },
  ],
  // Electronics
  electronics: [
    { value: 'rohs_compliant', label: 'RoHS Compliant' },
    { value: 'reach_compliant', label: 'REACH Compliant' },
    { value: 'conflict_free', label: 'Conflict Free' },
    { value: 'recycled_content', label: 'Recycled Content' },
  ],
  // Glass & Ceramics
  glass: [
    { value: 'virgin', label: 'Virgin' },
    { value: 'recycled', label: 'Recycled' },
    { value: 'lead_free', label: 'Lead Free' },
  ],
  // Wood & Paper
  wood: [
    { value: 'virgin', label: 'Virgin' },
    { value: 'fsc_certified', label: 'FSC Certified' },
    { value: 'recycled', label: 'Recycled' },
    { value: 'reclaimed', label: 'Reclaimed' },
  ],
  // Rubber & Elastomers
  rubber: [
    { value: 'natural', label: 'Natural' },
    { value: 'synthetic', label: 'Synthetic' },
    { value: 'recycled', label: 'Recycled' },
  ],
  // Food & Beverages
  food: [
    { value: 'organic', label: 'Organic' },
    { value: 'non_gmo', label: 'Non-GMO' },
    { value: 'fair_trade', label: 'Fair Trade' },
    { value: 'rainforest_alliance', label: 'Rainforest Alliance' },
    { value: 'usda_organic', label: 'USDA Organic' },
    { value: 'local', label: 'Local Sourced' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'regenerative', label: 'Regenerative Agriculture' },
    { value: 'biodynamic', label: 'Biodynamic' },
  ],
  // Meat & Seafood
  meat: [
    { value: 'grass_fed', label: 'Grass-fed' },
    { value: 'free_range', label: 'Free-range' },
    { value: 'organic', label: 'Organic' },
    { value: 'sustainably_farmed', label: 'Sustainably Farmed' },
    { value: 'wild_caught', label: 'Wild Caught' },
  ],
  // Default variants
  default: [
    { value: 'conventional', label: 'Conventional' },
    { value: 'sustainable', label: 'Sustainable' },
    { value: 'recycled', label: 'Recycled' },
  ]
} as const;

// Map material types to their variant categories
const MATERIAL_VARIANT_MAP = {
  // Textiles
  'cotton': 'textiles',
  'organic_cotton': 'textiles',
  'polyester': 'textiles',
  'recycled_polyester': 'textiles',
  'wool': 'textiles',
  'silk': 'textiles',
  'linen': 'textiles',
  'hemp': 'textiles',
  'bamboo': 'textiles',
  'lyocell': 'textiles',
  'modal': 'textiles',
  'nylon': 'textiles',
  'spandex': 'textiles',
  'acrylic': 'textiles',
  'viscose': 'textiles',
  
  // Leather
  'leather': 'leather',
  'vegan_leather': 'leather',
  'recycled_leather': 'leather',
  'cork': 'leather',
  'piñatex': 'leather',
  'mushroom_leather': 'leather',
  
  // Plastics
  'abs': 'plastics',
  'pet': 'plastics',
  'hdpe': 'plastics',
  'ldpe': 'plastics',
  'pp': 'plastics',
  'ps': 'plastics',
  'pvc': 'plastics',
  'bioplastic': 'plastics',
  'recycled_plastic': 'plastics',
  
  // Metals
  'aluminum': 'metals',
  'recycled_aluminum': 'metals',
  'steel': 'metals',
  'stainless_steel': 'metals',
  'recycled_steel': 'metals',
  'copper': 'metals',
  'brass': 'metals',
  'bronze': 'metals',
  'titanium': 'metals',
  'gold': 'metals',
  'silver': 'metals',
  
  // Electronics
  'pcb': 'electronics',
  'silicon': 'electronics',
  'lithium': 'electronics',
  'cobalt': 'electronics',
  'neodymium': 'electronics',
  'tantalum': 'electronics',
  'solder': 'electronics',
  
  // Glass & Ceramics
  'glass': 'glass',
  'recycled_glass': 'glass',
  'ceramic': 'glass',
  'porcelain': 'glass',
  'stoneware': 'glass',
  
  // Wood & Paper
  'hardwood': 'wood',
  'softwood': 'wood',
  'plywood': 'wood',
  'mdf': 'wood',
  'bamboo_wood': 'wood',
  'paper': 'wood',
  'cardboard': 'wood',
  'recycled_paper': 'wood',
  
  // Rubber & Elastomers
  'natural_rubber': 'rubber',
  'synthetic_rubber': 'rubber',
  'silicone': 'rubber',
  'tpe': 'rubber',
  'tpu': 'rubber',
  
  // Food & Beverages
  'fruits': 'food',
  'vegetables': 'food',
  'grains': 'food',
  'legumes': 'food',
  'nuts_seeds': 'food',
  'dairy': 'food',
  'oils_fats': 'food',
  'sweeteners': 'food',
  'beverages': 'food',
  'herbs_spices': 'food',
  'processed_food': 'food',
  
  // Meat & Seafood
  'meat': 'meat',
  'poultry': 'meat',
  'seafood': 'meat',
  'plant_based': 'food',
} as const;

type MaterialVariant = {
  value: string;
  label: string;
  group: string;
};

// Add stubs for missing functions
const removeMaterial = (index: number) => {};
const addMaterial = () => {};
const updateTransportLeg = (index: number, key: string, value: any) => {};
const removeTransportLeg = (index: number) => {};
const addTransportLeg = () => {};

// Fix ErrorBoundary to accept children as a prop
class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode, children?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback?: React.ReactNode, children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

// Loading component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    </div>
  </div>
);

// Not Authorized component
const NotAuthorized = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <Button onClick={() => window.location.href = '/'} className="bg-[#0071CE] hover:bg-blue-700">
          Go to Home
        </Button>
      </div>
    </div>
  </div>
);

// Main Admin Content Component
const AdminContent = ({ products, setProducts }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) => {
  // Authentication and navigation
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for UI only
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isBrandAttributesOpen, setIsBrandAttributesOpen] = useState(false);
  
  // Product form state
  const [newProduct, setNewProduct] = useState<ProductFormData>(() => ({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    category: '',
    brand: '',
    materials: [],
    manufacturing_location: '',
    supplier_id: null,
    brand_attributes: [],
    carbon_footprint: 0,
    carbon_footprint_breakdown: {
      materials: 0,
      transport: 0,
      manufacturing: 0,
      packaging: 0,
      usePhase: 0,
      endOfLife: 0
    },
    sustainability_data: {
      materials: [],
      weight_kg: 0,
      manufacturing: {
        energySource: 'globalAverage',
        energyKwh: 0,
        location: '',
        processEfficiency: 1
      },
      transport: [],
      packaging: {
        type: '',
        weight_kg: 0,
        isRecyclable: false,
        isRecycled: false
      },
      lifecycle: {
        expectedLifespan_years: 0,
        usePhaseImpact: 0,
        disposalMethod: 'recycling',
        recyclabilityRate: 0
      }
    },
    expiration_date: null
  }));

  // Brand attributes
  const BRAND_ATTRIBUTES: BrandAttribute[] = [
    { value: 'women_led', label: 'Women-Led' },
    { value: 'sustainable', label: 'Sustainable' },
    { value: 'cruelty_free', label: 'Cruelty Free' },
    { value: 'made_in_india', label: 'Made in India' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'fair_trade', label: 'Fair Trade' },
    { value: 'handmade', label: 'Handmade' },
    { value: 'organic', label: 'Organic' },
    { value: 'eco_friendly', label: 'Eco-Friendly' },
    { value: 'ethically_sourced', label: 'Ethically Sourced' },
    { value: 'carbon_neutral', label: 'Carbon Neutral' },
    { value: 'plastic_free', label: 'Plastic Free' },
    { value: 'small_business', label: 'Small Business' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
  ];

  // Derived state
  const { lowStockProducts, totalValue, outOfStockCount } = useMemo(() => {
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
    const total = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const outOfStock = products.filter(p => p.stock <= 0).length;
    
    return {
      lowStockProducts: lowStock,
      totalValue: total,
      outOfStockCount: outOfStock
    };
  }, [products]);

  // Get brand attributes for display
  const selectedBrandAttributes = useMemo(() => {
    return BRAND_ATTRIBUTES.filter(attr => 
      newProduct.brand_attributes?.includes(attr.value)
    );
  }, [newProduct.brand_attributes]);

  // Toggle brand attribute selection
  const toggleBrandAttribute = (value: string) => {
    setNewProduct(prev => {
      const currentAttrs = prev.brand_attributes || [];
      const newAttrs = currentAttrs.includes(value)
        ? currentAttrs.filter(attr => attr !== value)
        : [...currentAttrs, value];
      
      return { ...prev, brand_attributes: newAttrs };
    });
  };

  // Handle brand attributes selection
  const handleBrandAttributeSelect = (value: string) => {
    toggleBrandAttribute(value);
  };

  // Check if brand attribute is selected
  const isBrandAttributeSelected = useCallback((value: string) => {
    return newProduct.brand_attributes?.includes(value) || false;
  }, [newProduct.brand_attributes]);

  // Initialize sustainabilityData with the correct structure
  const [sustainabilityData, setSustainabilityData] = useState<any>({
    materials: [
      { 
        type: 'cotton', 
        percentage: 50, 
        isRecycled: false, 
        variant: 'conventional',
        weight_kg: 0.25 // 50% of 0.5kg
      },
      { 
        type: 'polyester', 
        percentage: 30, 
        isRecycled: false, 
        variant: 'virgin',
        weight_kg: 0.15 // 30% of 0.5kg
      },
      { 
        type: 'elastane', 
        percentage: 20, 
        isRecycled: false, 
        variant: 'standard',
        weight_kg: 0.1 // 20% of 0.5kg
      },
    ],
    weight_kg: 0.5,
    manufacturing: {
      energySource: 'globalAverage',
      energyKwh: 10,
      location: 'India',
      processEfficiency: 0.8
    },
    transport: [
      { 
        mode: 'truck', 
        distance_km: 500, 
        weight_kg: 0.5 
      },
      { 
        mode: 'ship', 
        distance_km: 2000, 
        weight_kg: 0.5 
      },
    ],
    packaging: {
      type: 'plastic',
      weight_kg: 0.1,
      isRecyclable: true,
      isRecycled: false,
    },
    lifecycle: {
      expectedLifespan_years: 2,
      usePhaseImpact: 5,
      disposalMethod: 'recycling',
      recyclabilityRate: 0.3,
    }
  });

  // Move updateMaterial here so it can access setSustainabilityData
  const updateMaterial = (index: number, key: string, value: any) => {
    setSustainabilityData((prev: any) => {
      const materials = [...prev.materials];
      materials[index] = { ...materials[index], [key]: value };
      return { ...prev, materials };
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'weight_kg'
        ? parseFloat(value) || 0
        : name === 'materials'
          ? value.split(',').map((v: string) => v.trim()).filter(Boolean)
          : name === 'expiration_date'
            ? value || null
            : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProduct(true);
    try {
      // Calculate carbon footprint for the current sustainabilityData
      const calculatedFootprint = calculateProductFootprint(sustainabilityData);
      const productData = {
        ...newProduct,
        sustainability_data: sustainabilityData,
        carbon_footprint: calculatedFootprint.total,
        carbon_footprint_breakdown: calculatedFootprint.breakdown,
        updated_at: new Date().toISOString()
      };
      const result = await supabaseAddProduct(productData);
      if (result !== null) {
        setProducts(prev => (Array.isArray(prev) && result ? [...prev, result as Product] : prev));
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          image: '',
          category: '',
          brand: '',
          materials: [],
          manufacturing_location: '',
          supplier_id: null,
          brand_attributes: [],
          carbon_footprint: 0,
          carbon_footprint_breakdown: {
            materials: 0,
            transport: 0,
            manufacturing: 0,
            packaging: 0,
            usePhase: 0,
            endOfLife: 0
          },
          sustainability_data: {
            materials: [],
            weight_kg: 0,
            manufacturing: {
              energySource: 'globalAverage',
              energyKwh: 0,
              location: '',
              processEfficiency: 1
            },
            transport: [],
            packaging: {
              type: '',
              weight_kg: 0,
              isRecyclable: false,
              isRecycled: false
            },
            lifecycle: {
              expectedLifespan_years: 0,
              usePhaseImpact: 0,
              disposalMethod: 'recycling',
              recyclabilityRate: 0
            }
          },
          expiration_date: null
        });
        toast({ title: 'Success', description: 'Product added successfully', variant: 'default' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: 'Error', description: 'An error occurred while adding the product', variant: 'destructive' });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Update product stock in Supabase and local state
  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;

      // Update in local state
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
    }
  };

  // Delete product from Supabase and local state
  const handleDeleteProduct = async (productId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const CommandContent = () => {
    let safeAttributes = Array.isArray(BRAND_ATTRIBUTES) ? BRAND_ATTRIBUTES : [];
    return (
      <Command>
        <CommandInput placeholder="Search attributes..." />
        <CommandList>
          <CommandEmpty>No attributes found.</CommandEmpty>
          {safeAttributes.length > 0 ? (
            <CommandGroup>
              {safeAttributes.map(attr => (
                <CommandItem
                  key={attr.value}
                  onSelect={() => handleBrandAttributeSelect(attr.value)}
                >
                  <span>
                    {isBrandAttributeSelected(attr.value) ? '✓ ' : ''}
                    {attr.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    );
  };
  const footprint = useMemo(() => {
    if (!sustainabilityData) return { total: 0, breakdown: { materials: 0, transport: 0, manufacturing: 0, packaging: 0, usePhase: 0, endOfLife: 0 }, details: {} };
    try {
      return calculateProductFootprint(sustainabilityData);
    } catch (e) {
      return { total: 0, breakdown: { materials: 0, transport: 0, manufacturing: 0, packaging: 0, usePhase: 0, endOfLife: 0 }, details: {} };
    }
  }, [sustainabilityData]);

  // Implement addMaterial to add a new material to the materials array in sustainabilityData
  const addMaterial = () => {
    setSustainabilityData((prev: any) => {
      const newMaterial = {
        type: '',
        percentage: 0,
        isRecycled: false,
        variant: '',
        weight_kg: 0
      };
      return { ...prev, materials: [...prev.materials, newMaterial] };
    });
  };

  // Implement removeMaterial to update the materials array in sustainabilityData
  const removeMaterial = (index: number) => {
    setSustainabilityData((prev: any) => {
      const materials = prev.materials.filter((_: any, i: number) => i !== index);
      return { ...prev, materials };
    });
  };

  // Implement addTransportLeg to add a new transport leg to the transport array in sustainabilityData
  const addTransportLeg = () => {
    setSustainabilityData((prev: any) => {
      const newLeg = {
        mode: '',
        distance_km: 0,
        weight_kg: 0
      };
      return { ...prev, transport: [...prev.transport, newLeg] };
    });
  };

  // Implement removeTransportLeg to update the transport array in sustainabilityData
  const removeTransportLeg = (index: number) => {
    setSustainabilityData((prev: any) => {
      const transport = prev.transport.filter((_: any, i: number) => i !== index);
      return { ...prev, transport };
    });
  };

  // Replace the stub with a real implementation
  const updateTransportLeg = (index: number, key: string, value: any) => {
    setSustainabilityData((prev: any) => {
      const transport = [...prev.transport];
      transport[index] = { ...transport[index], [key]: value };
      return { ...prev, transport };
    });
  };

  // Ensure the component returns JSX
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your store inventory and view analytics</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-[#0071CE]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                    <p className="text-2xl font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-semibold text-gray-900">{lowStockProducts.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-semibold text-gray-900">{outOfStockCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Low Stock Alert
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>The following products are running low on stock:</p>
                      <ul className="list-disc list-inside mt-1">
                        {lowStockProducts.map(product => (
                          <li key={product.id}>
                            {product.name} - {product.stock} remaining
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">New product "Organic Cotton T-Shirt" added to inventory</span>
                  <span className="text-gray-400 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Stock updated for "Bamboo Water Bottle"</span>
                  <span className="text-gray-400 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Low stock alert for "Recycled Notebook"</span>
                  <span className="text-gray-400 ml-auto">1 day ago</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager 
              products={products} 
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium">Product Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-name">Product Name *</Label>
                          <Input
                            id="product-name"
                            name="name"
                            value={newProduct.name || ''}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Organic Cotton T-Shirt"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-brand">Brand</Label>
                          <Input
                            id="product-brand"
                            name="brand"
                            value={newProduct.brand || ''}
                            onChange={handleInputChange}
                            className="mb-2"
                          />
                          
                          <div className="space-y-2">
                            <Label>Brand Attributes</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    selectedBrandAttributes.length === 0 && "text-muted-foreground"
                                  )}
                                >
                                  {selectedBrandAttributes.length > 0
                                    ? `${selectedBrandAttributes.length} selected`
                                    : "Select attributes..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <ErrorBoundary fallback={<div className="p-2 text-red-500">Error loading attributes</div>}>
                                  <CommandContent />
                                </ErrorBoundary>
                              </PopoverContent>
                            </Popover>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedBrandAttributes.map((attr) => (
                                <Badge key={attr.value} variant="secondary">
                                  {attr.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-category">Category</Label>
                          <Input
                            id="product-category"
                            name="category"
                            value={newProduct.category || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-materials">Materials (comma-separated)</Label>
                          <Input
                            id="product-materials"
                            name="materials"
                            value={newProduct.materials?.join(', ') || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., organic cotton, recycled polyester"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-description">Description *</Label>
                          <Textarea
                            id="product-description"
                            name="description"
                            value={newProduct.description || ''}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            placeholder="Detailed product description..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-manufacturing-location">Manufacturing Location</Label>
                          <Input
                            id="product-manufacturing-location"
                            name="manufacturing_location"
                            value={newProduct.manufacturing_location || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., Dhaka, Bangladesh"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-image">Image URL</Label>
                          <Input
                            id="product-image"
                            name="image"
                            value={newProduct.image || ''}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-expiration-date">Expiration Date</Label>
                          <Input
                            id="product-expiration-date"
                            name="expiration_date"
                            type="date"
                            value={newProduct.expiration_date || ''}
                            onChange={handleInputChange}
                            placeholder="Select expiration date"
                          />
                          <p className="text-sm text-gray-500">Leave empty if product doesn't expire</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing & Stock */}
                  <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Pricing & Inventory</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Leaf className="h-4 w-4 mr-1 text-green-500" />
                        <span>Estimated Carbon Footprint: <span className="font-semibold">{footprint.total.toFixed(2)} kg CO₂e</span></span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-price">Price ($) *</Label>
                          <Input
                            id="product-price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={isNaN(newProduct.price) ? '' : newProduct.price}
                            onChange={handleInputChange}
                            required
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="product-stock">Initial Stock *</Label>
                          <Input
                            id="product-stock"
                            name="stock"
                            type="number"
                            min="0"
                            value={isNaN(newProduct.stock) ? '' : newProduct.stock}
                            onChange={handleInputChange}
                            required
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-supplier">Supplier ID (optional)</Label>
                          <Input
                            id="product-supplier"
                            name="supplier_id"
                            value={newProduct.supplier_id || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., sup_12345"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="product-sku">SKU (auto-generated)</Label>
                            <span className="text-sm text-gray-500">Will be generated on save</span>
                          </div>
                          <Input
                            id="product-sku"
                            disabled
                            placeholder="e.g., PROD-XXXXXX"
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sustainability Tabs */}
                  <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600" />
                      Sustainability Data
                    </h3>
                    
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        {['basic', 'materials', 'manufacturing', 'transport', 'packaging', 'lifecycle'].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab
                                ? 'border-[#0071CE] text-[#0071CE]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-4">
                      {/* Basic Tab */}
                      {activeTab === 'basic' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>Product Weight (kg) *</Label>
                              <Input
                                id="product-weight"
                                name="weight_kg"
                                type="number"
                                step="0.01"
                                min="0"
                                value={isNaN(sustainabilityData?.weight_kg) ? '' : sustainabilityData?.weight_kg}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  weight_kg: parseFloat(e.target.value) || 0
                                })}
                                required
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="w-full">
                                <Label>Carbon Footprint</Label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                                  <div className="text-2xl font-semibold text-gray-900">
                                    {footprint.total.toFixed(2)} kg CO₂e
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {footprint.breakdown?.materials ? `Materials: ${footprint.breakdown.materials.toFixed(2)} kg • ` : ''}
                                    {footprint.breakdown?.transport ? `Transport: ${footprint.breakdown.transport.toFixed(2)} kg • ` : ''}
                                    {footprint.breakdown?.manufacturing ? `Manufacturing: ${footprint.breakdown.manufacturing.toFixed(2)} kg` : ''}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex">
                              <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Sustainability Impact</h3>
                                <div className="mt-1 text-sm text-blue-700">
                                  <p>This product's carbon footprint is calculated based on the materials, manufacturing process, transportation, and packaging details you provide.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Materials Tab */}
                      {activeTab === 'materials' && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {sustainabilityData?.materials.map((material, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-4">
                                  <Label>Material Type</Label>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    name={`materials.${index}.type`}
                                    value={material?.type}
                                    onChange={(e) => updateMaterial(index, 'type', e.target.value)}
                                  >
                                    {/* Textiles & Fabrics */}
                                    <optgroup label="Textiles & Fabrics">
                                      <option value="cotton">Cotton</option>
                                      <option value="organic_cotton">Organic Cotton</option>
                                      <option value="polyester">Polyester</option>
                                      <option value="recycled_polyester">Recycled Polyester</option>
                                      <option value="wool">Wool</option>
                                      <option value="silk">Silk</option>
                                      <option value="linen">Linen</option>
                                      <option value="hemp">Hemp</option>
                                      <option value="bamboo">Bamboo</option>
                                      <option value="lyocell">Lyocell (Tencel)</option>
                                      <option value="modal">Modal</option>
                                      <option value="nylon">Nylon</option>
                                      <option value="spandex">Spandex</option>
                                      <option value="acrylic">Acrylic</option>
                                      <option value="viscose">Viscose/Rayon</option>
                                    </optgroup>

                                    {/* Leather & Alternatives */}
                                    <optgroup label="Leather & Alternatives">
                                      <option value="leather">Leather</option>
                                      <option value="vegan_leather">Vegan Leather</option>
                                      <option value="recycled_leather">Recycled Leather</option>
                                      <option value="cork">Cork</option>
                                      <option value="piñatex">Piñatex (Pineapple Leather)</option>
                                      <option value="mushroom_leather">Mushroom Leather</option>
                                    </optgroup>

                                    {/* Plastics & Polymers */}
                                    <optgroup label="Plastics & Polymers">
                                      <option value="abs">ABS Plastic</option>
                                      <option value="pet">PET Plastic</option>
                                      <option value="hdpe">HDPE Plastic</option>
                                      <option value="ldpe">LDPE Plastic</option>
                                      <option value="pp">Polypropylene (PP)</option>
                                      <option value="ps">Polystyrene (PS)</option>
                                      <option value="pvc">PVC</option>
                                      <option value="bioplastic">Bioplastic</option>
                                      <option value="recycled_plastic">Recycled Plastic</option>
                                    </optgroup>

                                    {/* Metals */}
                                    <optgroup label="Metals">
                                      <option value="aluminum">Aluminum</option>
                                      <option value="recycled_aluminum">Recycled Aluminum</option>
                                      <option value="steel">Steel</option>
                                      <option value="stainless_steel">Stainless Steel</option>
                                      <option value="recycled_steel">Recycled Steel</option>
                                      <option value="copper">Copper</option>
                                      <option value="brass">Brass</option>
                                      <option value="bronze">Bronze</option>
                                      <option value="titanium">Titanium</option>
                                      <option value="gold">Gold</option>
                                      <option value="silver">Silver</option>
                                    </optgroup>

                                    {/* Electronics Components */}
                                    <optgroup label="Electronics">
                                      <option value="pcb">PCB (Printed Circuit Board)</option>
                                      <option value="silicon">Silicon</option>
                                      <option value="lithium">Lithium (Batteries)</option>
                                      <option value="cobalt">Cobalt (Batteries)</option>
                                      <option value="neodymium">Neodymium (Magnets)</option>
                                      <option value="tantalum">Tantalum (Capacitors)</option>
                                      <option value="solder">Solder</option>
                                    </optgroup>

                                    {/* Glass & Ceramics */}
                                    <optgroup label="Glass & Ceramics">
                                      <option value="glass">Glass</option>
                                      <option value="recycled_glass">Recycled Glass</option>
                                      <option value="ceramic">Ceramic</option>
                                      <option value="porcelain">Porcelain</option>
                                      <option value="stoneware">Stoneware</option>
                                    </optgroup>

                                    {/* Wood & Paper */}
                                    <optgroup label="Wood & Paper">
                                      <option value="hardwood">Hardwood</option>
                                      <option value="softwood">Softwood</option>
                                      <option value="plywood">Plywood</option>
                                      <option value="mdf">MDF</option>
                                      <option value="bamboo_wood">Bamboo (Wood)</option>
                                      <option value="cork">Cork</option>
                                      <option value="paper">Paper</option>
                                      <option value="cardboard">Cardboard</option>
                                      <option value="recycled_paper">Recycled Paper</option>
                                    </optgroup>

                                    {/* Rubber & Elastomers */}
                                    <optgroup label="Rubber & Elastomers">
                                      <option value="natural_rubber">Natural Rubber</option>
                                      <option value="synthetic_rubber">Synthetic Rubber</option>
                                      <option value="silicone">Silicone</option>
                                      <option value="tpe">Thermoplastic Elastomer (TPE)</option>
                                      <option value="tpu">Thermoplastic Polyurethane (TPU)</option>
                                    </optgroup>

                                    {/* Composite Materials */}
                                    <optgroup label="Composite Materials">
                                      <option value="fiberglass">Fiberglass</option>
                                      <option value="carbon_fiber">Carbon Fiber</option>
                                      <option value="kevlar">Kevlar</option>
                                      <option value="wood_plastic">Wood-Plastic Composite</option>
                                    </optgroup>

                                    {/* Food & Beverages */}
                                    <optgroup label="Food & Beverages">
                                      <option value="fruits">Fruits</option>
                                      <option value="vegetables">Vegetables</option>
                                      <option value="grains">Grains & Cereals</option>
                                      <option value="legumes">Legumes & Pulses</option>
                                      <option value="nuts_seeds">Nuts & Seeds</option>
                                      <option value="dairy">Dairy Products</option>
                                      <option value="meat">Meat</option>
                                      <option value="poultry">Poultry</option>
                                      <option value="seafood">Seafood</option>
                                      <option value="plant_based">Plant-based Proteins</option>
                                      <option value="oils_fats">Oils & Fats</option>
                                      <option value="sweeteners">Sweeteners</option>
                                      <option value="beverages">Beverages</option>
                                      <option value="herbs_spices">Herbs & Spices</option>
                                      <option value="processed_food">Processed Food</option>
                                    </optgroup>

                                    <option value="other">Other (Please Specify)</option>
                                  </select>
                                </div>
                                <div className="md:col-span-3">
                                  <Label>Variant</Label>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    name={`materials.${index}.variant`}
                                    value={material?.variant}
                                    onChange={(e) => updateMaterial(index, 'variant', e.target.value)}
                                  >
                                    <option value="">Select variant</option>
                                    {getMaterialVariants(material?.type).map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-3">
                                  <Label>Percentage (%)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    name={`materials.${index}.percentage`}
                                    value={isNaN(material?.percentage) ? '' : material?.percentage}
                                    onChange={(e) => updateMaterial(index, 'percentage', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="md:col-span-2 flex items-end space-x-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`recycled-${index}`}
                                      name={`materials.${index}.isRecycled`}
                                      checked={material?.isRecycled}
                                      onChange={(e) => updateMaterial(index, 'isRecycled', e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-[#0071CE] focus:ring-[#0071CE]"
                                    />
                                    <Label htmlFor={`recycled-${index}`}>Recycled</Label>
                                  </div>
                                  {sustainabilityData?.materials.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeMaterial(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addMaterial}
                              >
                                + Add Material
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Manufacturing Tab */}
                      {activeTab === 'manufacturing' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>Energy Source</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                name="manufacturing.energySource"
                                value={sustainabilityData?.manufacturing.energySource}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  manufacturing: {
                                    ...sustainabilityData.manufacturing,
                                    energySource: e.target.value as any
                                  }
                                })}
                              >
                                <option value="globalAverage">Global Average</option>
                                <option value="renewable">Renewable</option>
                                <option value="coal">Coal</option>
                                <option value="gas">Natural Gas</option>
                                <option value="nuclear">Nuclear</option>
                                <option value="hydro">Hydro</option>
                                <option value="solar">Solar</option>
                                <option value="wind">Wind</option>
                              </select>
                            </div>
                            <div>
                              <Label>Energy Consumption (kWh)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                name="manufacturing.energyKwh"
                                value={isNaN(sustainabilityData?.manufacturing.energyKwh) ? '' : sustainabilityData?.manufacturing.energyKwh}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  manufacturing: {
                                    ...sustainabilityData.manufacturing,
                                    energyKwh: parseFloat(e.target.value) || 0
                                  }
                                })}
                              />
                            </div>
                            <div>
                              <Label>Manufacturing Location</Label>
                              <Input
                                name="manufacturing.location"
                                value={sustainabilityData?.manufacturing.location}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  manufacturing: {
                                    ...sustainabilityData.manufacturing,
                                    location: e.target.value
                                  }
                                })}
                                placeholder="e.g., Dhaka, Bangladesh"
                              />
                            </div>
                            <div>
                              <Label>Process Efficiency (0-1)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                name="manufacturing.processEfficiency"
                                value={isNaN(sustainabilityData?.manufacturing.processEfficiency) ? '' : sustainabilityData?.manufacturing.processEfficiency}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  manufacturing: {
                                    ...sustainabilityData.manufacturing,
                                    processEfficiency: parseFloat(e.target.value) || 1
                                  }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Transport Tab */}
                      {activeTab === 'transport' && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {sustainabilityData?.transport.map((leg, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-4">
                                  <Label>Transport Mode</Label>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    name={`transport.${index}.mode`}
                                    value={leg.mode}
                                    onChange={(e) => updateTransportLeg(index, 'mode', e.target.value)}
                                  >
                                    <option value="truck">Truck</option>
                                    <option value="ship">Ship</option>
                                    <option value="plane">Air Freight</option>
                                    <option value="train">Train</option>
                                    <option value="van">Van</option>
                                  </select>
                                </div>
                                <div className="md:col-span-4">
                                  <Label>Distance (km)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    name={`transport.${index}.distance_km`}
                                    value={leg.distance_km === '' || isNaN(leg.distance_km) ? '' : leg.distance_km}
                                    onChange={e => updateTransportLeg(index, 'distance_km', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <Label>Weight (kg, optional)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    name={`transport.${index}.weight_kg`}
                                    value={leg.weight_kg === '' || isNaN(leg.weight_kg) ? '' : leg.weight_kg}
                                    onChange={e => updateTransportLeg(index, 'weight_kg', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    placeholder="Total weight"
                                  />
                                </div>
                                <div className="md:col-span-1 flex items-end">
                                  {sustainabilityData?.transport.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTransportLeg(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTransportLeg}
                              >
                                + Add Transport Leg
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Packaging Tab */}
                      {activeTab === 'packaging' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>Packaging Material</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                name="packaging.type"
                                value={sustainabilityData?.packaging.type}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  packaging: {
                                    ...sustainabilityData.packaging,
                                    type: e.target.value
                                  }
                                })}
                              >
                                <option value="paper">Paper/Cardboard</option>
                                <option value="plastic">Plastic</option>
                                <option value="glass">Glass</option>
                                <option value="metal">Metal</option>
                                <option value="biodegradable">Biodegradable</option>
                                <option value="recycled">Recycled Material</option>
                              </select>
                            </div>
                            <div>
                              <Label>Weight (kg)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                name="packaging.weight_kg"
                                value={isNaN(sustainabilityData?.packaging.weight_kg) ? '' : sustainabilityData?.packaging.weight_kg}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  packaging: {
                                    ...sustainabilityData.packaging,
                                    weight_kg: parseFloat(e.target.value) || 0
                                  }
                                })}
                              />
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="is-recyclable"
                                  name="packaging.isRecyclable"
                                  checked={sustainabilityData?.packaging.isRecyclable}
                                  onChange={(e) => setSustainabilityData({
                                    ...sustainabilityData,
                                    packaging: {
                                      ...sustainabilityData.packaging,
                                      isRecyclable: e.target.checked
                                    }
                                  })}
                                  className="h-4 w-4 rounded border-gray-300 text-[#0071CE] focus:ring-[#0071CE]"
                                />
                                <Label htmlFor="is-recyclable">Recyclable</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="is-recycled"
                                  name="packaging.isRecycled"
                                  checked={sustainabilityData?.packaging.isRecycled}
                                  onChange={(e) => setSustainabilityData({
                                    ...sustainabilityData,
                                    packaging: {
                                      ...sustainabilityData.packaging,
                                      isRecycled: e.target.checked
                                    }
                                  })}
                                  className="h-4 w-4 rounded border-gray-300 text-[#0071CE] focus:ring-[#0071CE]"
                                />
                                <Label htmlFor="is-recycled">Made from Recycled Material</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lifecycle Tab */}
                      {activeTab === 'lifecycle' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>Expected Lifespan (years)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                name="lifecycle.expectedLifespan_years"
                                value={sustainabilityData?.lifecycle.expectedLifespan_years === '' || isNaN(sustainabilityData?.lifecycle.expectedLifespan_years) ? '' : sustainabilityData?.lifecycle.expectedLifespan_years}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSustainabilityData({
                                    ...sustainabilityData,
                                    lifecycle: {
                                      ...sustainabilityData.lifecycle,
                                      expectedLifespan_years: val === '' ? '' : parseFloat(val)
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label>Use Phase Impact (kg CO₂e)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                name="lifecycle.usePhaseImpact"
                                value={sustainabilityData?.lifecycle.usePhaseImpact === '' || isNaN(sustainabilityData?.lifecycle.usePhaseImpact) ? '' : sustainabilityData?.lifecycle.usePhaseImpact}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSustainabilityData({
                                    ...sustainabilityData,
                                    lifecycle: {
                                      ...sustainabilityData.lifecycle,
                                      usePhaseImpact: val === '' ? '' : parseFloat(val)
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label>Disposal Method</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                name="lifecycle.disposalMethod"
                                value={sustainabilityData?.lifecycle.disposalMethod}
                                onChange={(e) => setSustainabilityData({
                                  ...sustainabilityData,
                                  lifecycle: {
                                    ...sustainabilityData.lifecycle,
                                    disposalMethod: e.target.value as any
                                  }
                                })}
                              >
                                <option value="recycling">Recycling</option>
                                <option value="landfill">Landfill</option>
                                <option value="incineration">Incineration</option>
                                <option value="compost">Compost</option>
                              </select>
                            </div>
                            <div>
                              <Label>Recyclability Rate (0-1)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.01"
                                name="lifecycle.recyclabilityRate"
                                value={sustainabilityData?.lifecycle.recyclabilityRate === '' || isNaN(sustainabilityData?.lifecycle.recyclabilityRate) ? '' : sustainabilityData?.lifecycle.recyclabilityRate}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSustainabilityData({
                                    ...sustainabilityData,
                                    lifecycle: {
                                      ...sustainabilityData.lifecycle,
                                      recyclabilityRate: val === '' ? '' : parseFloat(val)
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#0071CE] hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Order Management</h3>
              <p className="text-gray-500">Order management functionality will be available soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="forecast">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Demand Forecasting</h3>
                  <p className="text-gray-500">AI-powered demand predictions for inventory planning</p>
                </div>
                <Link to="/admin/forecast" className="block" onClick={() => console.log('Navigating to /admin/forecast')}>
                  <Button className="bg-[#0071CE] hover:bg-blue-700 w-full">
                    Open Forecast Dashboard
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">What is Demand Forecasting?</h4>
                  <p className="text-sm text-blue-700">
                    Our AI system analyzes historical sales data to predict future demand for your products. 
                    This helps you optimize inventory levels and reduce stockouts or overstock situations.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Benefits</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Reduce inventory costs</li>
                    <li>• Prevent stockouts</li>
                    <li>• Optimize reorder timing</li>
                    <li>• Improve cash flow</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Select a product from your inventory</li>
                  <li>2. Choose the forecast period (weeks)</li>
                  <li>3. View AI-generated predictions with confidence intervals</li>
                  <li>4. Use the data to make informed inventory decisions</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Admin = () => {
  const user = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [toast]);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      // ... authentication logic ...
    };
    checkAuth();
  }, [navigate]);

  // Show loading state while checking auth or roles
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary>
      <AdminContent products={products} setProducts={setProducts} />
    </ErrorBoundary>
  );
};

// Implement getMaterialVariants to return the correct variant options for a given material type
const getMaterialVariants = (type: string) => {
  if (!type) return VARIANT_OPTIONS.default;
  const group = MATERIAL_VARIANT_MAP[type] || 'default';
  return VARIANT_OPTIONS[group] || VARIANT_OPTIONS.default;
};

export default Admin;
