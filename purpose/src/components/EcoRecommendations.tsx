import React from 'react';
import { Leaf, TrendingUp } from 'lucide-react';
import { Product } from '@/lib/products';
import { getEcoRecommendations } from '@/lib/ecoScore';
import ProductCard from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EcoRecommendationsProps {
  currentProduct: Product;
  allProducts: Product[];
  limit?: number;
  className?: string;
}

const EcoRecommendations: React.FC<EcoRecommendationsProps> = ({
  currentProduct,
  allProducts,
  limit = 4,
  className = ''
}) => {
  const recommendations = getEcoRecommendations(currentProduct, allProducts, limit);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Leaf className="h-5 w-5" />
          Eco-Friendly Alternatives
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardTitle>
        <p className="text-sm text-gray-600">
          Discover similar products with better environmental impact
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="h-full"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EcoRecommendations; 