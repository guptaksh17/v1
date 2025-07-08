import React from 'react';
import { TrendingUp, Clock, Package } from 'lucide-react';
import { Product } from '@/lib/products';
import { calculateDynamicPricing } from '@/lib/dynamicPricing';

interface PricingInsightsProps {
  products: Product[];
}

const PricingInsights: React.FC<PricingInsightsProps> = ({ products }) => {
  const criticalProducts = products.filter(product => {
    const pricing = calculateDynamicPricing(product);
    return pricing.daysUntilExpiry !== undefined && pricing.daysUntilExpiry <= 7;
  });

  const highStockProducts = products.filter(product => product.stock > 100);

  if (criticalProducts.length === 0 && highStockProducts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">All products have optimal pricing</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Pricing Insights</h3>
      
      {criticalProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Products Expiring Soon</span>
          </div>
          <div className="space-y-2">
            {criticalProducts.slice(0, 3).map(product => {
              const pricing = calculateDynamicPricing(product);
              return (
                <div key={product.id} className="text-sm">
                  <span className="font-medium">{product.name}</span> - 
                  Expires in {pricing.daysUntilExpiry} days
                  {pricing.discountPercentage > 0 && (
                    <span className="text-red-600 ml-2">
                      (Currently {Math.round(pricing.discountPercentage)}% off)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {highStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Package className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">High Stock Products</span>
          </div>
          <div className="space-y-2">
            {highStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="text-sm">
                <span className="font-medium">{product.name}</span> - 
                {product.stock} units in stock
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingInsights; 