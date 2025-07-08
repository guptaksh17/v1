
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/products';
import { toast } from 'react-hot-toast';
import EcoScoreBadge from './EcoScoreBadge';
import { calculateDynamicPricing, getDiscountBadgeColor, formatPrice } from '@/lib/dynamicPricing';

interface ProductCardProps {
  product: Product | null | undefined;
  onAddToCart?: (e: React.MouseEvent, product: Product) => void;
  className?: string;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  className = '',
  onClick
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (onAddToCart && product) {
        onAddToCart(e, product);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Handle null/undefined product
  if (!product) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="text-center text-gray-500">
          Product not available
        </div>
      </div>
    );
  }

  // Safely destructure with defaults
  const {
    id,
    name = 'Unnamed Product',
    description = '',
    price = 0,
    stock = 0,
    image = '',
    category = 'Uncategorized',
    brand = 'Unknown Brand',
    materials = [],
    manufacturing_location,
    expiration_date
  } = product;

  // Calculate dynamic pricing
  const pricing = calculateDynamicPricing(product);

  // Safely determine product status
  const isOutOfStock = !stock || stock <= 0;
  const isLowStock = !isOutOfStock && stock <= 10;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group ${className}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img 
            src={image || '/placeholder-product.jpg'} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
        
        {/* Product status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {pricing.isOnSale && (
            <div className={`${getDiscountBadgeColor(pricing.urgencyLevel)} px-2 py-1 rounded-full text-xs font-bold`}>
              {pricing.urgencyLevel === 'critical' ? 'URGENT' : 'SALE'}
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              OUT OF STOCK
            </div>
          )}
          {isLowStock && !pricing.isOnSale && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              LOW STOCK
            </div>
          )}
        </div>
        
        {/* Eco-Score Badge */}
        <div className="absolute top-3 right-3 z-10">
          <EcoScoreBadge product={product} size="sm" compact={true} />
        </div>
      </div>
      
      <div className="p-4">
        {/* Category and materials */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
            {category || 'Uncategorized'}
          </span>
          {materials.slice(0, 2).map((material, index) => (
            <span key={index} className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
              {material}
            </span>
          ))}
          {materials.length > 2 && (
            <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-full text-xs">
              +{materials.length - 2} more
            </span>
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-2">{brand || 'Generic Brand'}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[#0071CE]">
              {formatPrice(pricing.discountedPrice)}
            </span>
            {pricing.isOnSale && (
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(pricing.originalPrice)}
              </span>
            )}
          </div>
          
          {manufacturing_location && (
            <div className="text-xs text-gray-500">
              Made in {manufacturing_location}
            </div>
          )}
        </div>
        
        <button 
          className={`w-full py-2 px-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 ${
            isOutOfStock 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#0071CE] hover:bg-blue-700 text-white'
          }`}
          onClick={(e) => !isOutOfStock && onAddToCart?.(e, product)}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
        
        {expiration_date && (
          <div className="mt-2 text-xs text-gray-500">
            {pricing.isOnSale ? 'Expires soon: ' : 'Expires: '}
            {new Date(expiration_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
