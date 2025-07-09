export interface PricingRule {
  id: string;
  name: string;
  condition: (product: any) => boolean;
  discountPercentage: number;
  maxDiscount?: number;
  priority: number; // Higher priority rules are applied first
}

export interface DynamicPricingResult {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  discountAmount: number;
  appliedRules: string[];
  isOnSale: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  daysUntilExpiry?: number;
}

// Define pricing rules
export const PRICING_RULES: PricingRule[] = [
  // Critical: Expiring within 3 days - 50% off
  {
    id: 'critical-expiry',
    name: 'Critical Expiry',
    condition: (product) => {
      if (!product.expiration_date) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiration_date);
      return daysUntilExpiry <= 3 && product.stock > 0;
    },
    discountPercentage: 50,
    priority: 100
  },
  
  // High urgency: Expiring within 7 days - 30% off
  {
    id: 'high-expiry',
    name: 'High Expiry Urgency',
    condition: (product) => {
      if (!product.expiration_date) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiration_date);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 3 && product.stock > 0;
    },
    discountPercentage: 30,
    priority: 90
  },
  
  // Medium urgency: Expiring within 14 days - 20% off
  {
    id: 'medium-expiry',
    name: 'Medium Expiry Urgency',
    condition: (product) => {
      if (!product.expiration_date) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiration_date);
      return daysUntilExpiry <= 14 && daysUntilExpiry > 7 && product.stock > 0;
    },
    discountPercentage: 20,
    priority: 80
  },
  
  // Low urgency: Expiring within 30 days - 10% off
  {
    id: 'low-expiry',
    name: 'Low Expiry Urgency',
    condition: (product) => {
      if (!product.expiration_date) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiration_date);
      return daysUntilExpiry <= 30 && daysUntilExpiry > 14 && product.stock > 0;
    },
    discountPercentage: 10,
    priority: 70
  },
  
  // High stock: More than 100 units - 5% off
  {
    id: 'high-stock',
    name: 'High Stock Discount',
    condition: (product) => product.stock > 100,
    discountPercentage: 5,
    priority: 60
  },
  
  // Low stock: Less than 10 units - 15% off (to clear inventory)
  {
    id: 'low-stock',
    name: 'Low Stock Clearance',
    condition: (product) => product.stock <= 10 && product.stock > 0,
    discountPercentage: 15,
    priority: 50
  }
];

/**
 * Calculate days until expiry
 */
function getDaysUntilExpiry(expirationDate: string): number {
  const expiryDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get urgency level based on days until expiry
 */
function getUrgencyLevel(daysUntilExpiry?: number): 'low' | 'medium' | 'high' | 'critical' {
  if (!daysUntilExpiry) return 'low';
  if (daysUntilExpiry <= 3) return 'critical';
  if (daysUntilExpiry <= 7) return 'high';
  if (daysUntilExpiry <= 14) return 'medium';
  return 'low';
}

/**
 * Calculate dynamic pricing for a product
 */
export function calculateDynamicPricing(product: any): DynamicPricingResult {
  const originalPrice = product.price || 0;
  let discountedPrice = originalPrice;
  let totalDiscountPercentage = 0;
  const appliedRules: string[] = [];
  
  // Sort rules by priority (highest first)
  const sortedRules = [...PRICING_RULES].sort((a, b) => b.priority - a.priority);
  
  // Apply rules
  for (const rule of sortedRules) {
    if (rule.condition(product)) {
      // Calculate cumulative discount (not additive, but based on remaining price)
      const remainingPrice = discountedPrice;
      const ruleDiscount = (remainingPrice * rule.discountPercentage) / 100;
      discountedPrice -= ruleDiscount;
      totalDiscountPercentage += rule.discountPercentage;
      appliedRules.push(rule.name);
      
      // Apply maximum discount limit if specified
      if (rule.maxDiscount) {
        const maxDiscountAmount = (originalPrice * rule.maxDiscount) / 100;
        const currentDiscountAmount = originalPrice - discountedPrice;
        if (currentDiscountAmount > maxDiscountAmount) {
          discountedPrice = originalPrice - maxDiscountAmount;
          totalDiscountPercentage = (maxDiscountAmount / originalPrice) * 100;
        }
      }
    }
  }
  
  // Ensure price doesn't go below 0
  discountedPrice = Math.max(0, discountedPrice);
  
  // Calculate final discount percentage
  const finalDiscountPercentage = originalPrice > 0 ? ((originalPrice - discountedPrice) / originalPrice) * 100 : 0;
  
  // Get urgency level
  const daysUntilExpiry = product.expiration_date ? getDaysUntilExpiry(product.expiration_date) : undefined;
  const urgencyLevel = getUrgencyLevel(daysUntilExpiry);
  
  return {
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
    discountPercentage: Math.round(finalDiscountPercentage * 100) / 100,
    discountAmount: Math.round((originalPrice - discountedPrice) * 100) / 100,
    appliedRules,
    isOnSale: discountedPrice < originalPrice,
    urgencyLevel,
    daysUntilExpiry
  };
}

/**
 * Get discount badge color based on urgency level
 */
export function getDiscountBadgeColor(urgencyLevel: string): string {
  switch (urgencyLevel) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * Get urgency message based on days until expiry
 */
export function getUrgencyMessage(daysUntilExpiry?: number): string {
  if (!daysUntilExpiry) return '';
  if (daysUntilExpiry <= 0) return 'Expired';
  if (daysUntilExpiry <= 3) return 'Expires soon!';
  if (daysUntilExpiry <= 7) return 'Limited time!';
  if (daysUntilExpiry <= 14) return 'Expiring soon';
  if (daysUntilExpiry <= 30) return 'Best before';
  return '';
}

/**
 * Format price with proper currency display
 */
export function formatPrice(price: number): string {
  return `₹${Math.round(price).toLocaleString()}`;
} 