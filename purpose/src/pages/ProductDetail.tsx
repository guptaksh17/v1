import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Shield, 
  Leaf, 
  Award, 
  Star, 
  Loader2,
  Leaf as LeafIcon,
  Factory,
  Truck,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/products';
import { toast } from 'react-hot-toast';
import { getFootprintDescription, calculateProductFootprint } from '@/lib/carbonFootprint';

interface FootprintInfo {
  label: string;
  description: string;
  equivalent: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const carbonFootprint = product?.carbon_footprint ?? null;

  // Calculate if product is on sale
  const isOnSale = useMemo(() => {
    if (!product?.expiration_date) return false;
    return new Date(product.expiration_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  }, [product]);

  // Calculate original price if on sale
  const originalPrice = useMemo(() => {
    return isOnSale && product?.price ? Math.round(product.price * 1.25) : undefined;
  }, [isOnSale, product?.price]);

  // Get footprint info
  const displayFootprintInfo = useMemo(() => {
    if (carbonFootprint) return getFootprintDescription(carbonFootprint);
    return null;
  }, [carbonFootprint]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found');

        // Ensure carbon_footprint_breakdown is the correct type
        let productData = data as unknown as Product;
        if (productData.carbon_footprint_breakdown && typeof productData.carbon_footprint_breakdown === 'object') {
          productData.carbon_footprint_breakdown = productData.carbon_footprint_breakdown as Product['carbon_footprint_breakdown'];
        }
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handlers
  const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleIncrease = () => {
    if (product?.stock && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0071CE]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the product you're looking for.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#0071CE] hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img 
                src={product.image || '/placeholder-product.jpg'} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square bg-gray-100 rounded border-2 border-[#0071CE]">
                <img 
                  src={product.image || '/placeholder-product.jpg'} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                {isOnSale && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    SALE
                  </span>
                )}
                {product.stock <= 0 && (
                  <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    OUT OF STOCK
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">by {product.brand || 'Unknown Brand'}</p>
              
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-5 w-5 ${i <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">(234 reviews)</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-4xl font-bold text-[#0071CE]">
                  ₹{product.price?.toLocaleString() || 'N/A'}
                </span>
                {isOnSale && originalPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      {Math.round(((originalPrice - (product.price || 0)) / originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              {isOnSale && originalPrice && product.price && (
                <p className="text-green-600 font-medium">
                  You save ₹{(originalPrice - product.price).toLocaleString()}
                </p>
              )}
            </div>
            
            {/* ESG Badges */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Sustainability Impact</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <Leaf className="h-6 w-6 text-[#8BC34A] mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {carbonFootprint !== null && carbonFootprint !== undefined ? `${carbonFootprint} kg CO₂` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">Carbon Footprint</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Shield className="h-6 w-6 text-[#0071CE] mx-auto mb-2" />
                  <p className="text-sm font-medium">9.2/10</p>
                  <p className="text-xs text-gray-600">Ethical Score</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Fair Trade</p>
                  <p className="text-xs text-gray-600">Certified</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#8BC34A] bg-opacity-10 text-[#8BC34A] px-3 py-1 rounded-full text-sm">♻️ Recycled</span>
                <span className="bg-[#8BC34A] bg-opacity-10 text-[#8BC34A] px-3 py-1 rounded-full text-sm">🌱 Low Carbon</span>
                <span className="bg-[#8BC34A] bg-opacity-10 text-[#8BC34A] px-3 py-1 rounded-full text-sm">🧕 Women-led</span>
              </div>
            </div>
            
            {/* Carbon Footprint Badge */}
            {carbonFootprint && displayFootprintInfo && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
                    <LeafIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Carbon Footprint: {carbonFootprint !== null && carbonFootprint !== undefined ? `${carbonFootprint} kg CO₂e` : 'N/A'}
                    </h3>
                    <div className="mt-1 text-sm text-green-700">
                      <p>{displayFootprintInfo.label} Impact • {displayFootprintInfo.description}</p>
                      <p className="mt-1 text-xs text-green-600">
                        {displayFootprintInfo.equivalent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <>
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="font-medium">Quantity:</label>
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={handleDecrease}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                        disabled={quantity <= 1}
                      >-</button>
                      <span className="px-4 py-2 border-x">{Math.min(quantity, product.stock)}</span>
                      <button 
                        onClick={handleIncrease}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                        disabled={quantity >= product.stock}
                      >+</button>
                    </div>
                    <span className="text-sm text-gray-600">{product.stock} in stock</span>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      className="flex-1 bg-[#0071CE] hover:bg-blue-700 text-white py-3 px-6 rounded-full font-semibold flex items-center justify-center space-x-2"
                      onClick={() => {
                        // TODO: Implement add to cart
                        toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </button>
                    <button 
                      className="p-3 border border-gray-300 rounded-full hover:bg-gray-50"
                      onClick={() => {
                        // TODO: Implement wishlist
                        toast('Added to wishlist');
                      }}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-3 border border-gray-300 rounded-full hover:bg-gray-50"
                      onClick={() => {
                        // TODO: Implement share
                        navigator.clipboard.writeText(window.location.href);
                        toast('Link copied to clipboard');
                      }}
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This product is currently out of stock.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Carbon Offset */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Offset Carbon Footprint</h4>
                  <p className="text-sm text-green-600">
                    Neutralize {carbonFootprint !== null && carbonFootprint !== undefined ? `${carbonFootprint.toFixed(2)} kg CO₂e` : 'N/A'} from this purchase
                  </p>
                </div>
                <button className="bg-[#8BC34A] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-500">
                  {carbonFootprint !== null && carbonFootprint !== undefined ? `+ ₹${(carbonFootprint * 0.5).toFixed(2)}` : '+ ₹0.00'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="border-b">
          <nav className="flex space-x-8">
            {[
              { id: 'description', label: 'Description' },
              { id: 'traceability', label: 'Traceability' },
              { id: 'reviews', label: 'Reviews (234)' },
              { id: 'impact', label: 'Impact' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id 
                    ? 'border-[#0071CE] text-[#0071CE]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="py-8">
          {selectedTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
              <ul className="mt-4 space-y-2">
                {product.materials && product.materials.length > 0 ? (
                  product.materials.map((material, index) => (
                    <li key={index}>• {material}</li>
                  ))
                ) : (
                  <li>• No material information available</li>
                )}
                {product.manufacturing_location && (
                  <li>• Made in {product.manufacturing_location}</li>
                )}
                {product.expiration_date && (
                  <li>• Best before: {new Date(product.expiration_date).toLocaleDateString()}</li>
                )}
              </ul>
            </div>
          )}
          
          {selectedTab === 'traceability' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Blockchain Verified Supply Chain</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-[#8BC34A] rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium">Organic Cotton Farm - Gujarat, India</p>
                    <p className="text-sm text-gray-600">Certified organic cultivation, fair wages</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-[#8BC34A] rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium">Processing Facility - Tamil Nadu, India</p>
                    <p className="text-sm text-gray-600">GOTS certified, renewable energy powered</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-[#8BC34A] rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium">Manufacturing - Bangalore, India</p>
                    <p className="text-sm text-gray-600">Fair trade certified, women-led cooperative</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'reviews' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">4.2</div>
                  <div>
                    <div className="flex items-center mb-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-5 w-5 ${i <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'impact' && (
            <div>
              {/* Impact section content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;