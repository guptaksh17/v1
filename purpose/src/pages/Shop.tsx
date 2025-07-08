
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart } from 'lucide-react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { retryOperation } from '@/lib/auth-utils';
import { Product } from '../lib/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { calculateEcoScoreForProduct } from '@/lib/ecoScore';

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    priceRange: '',
    ecoScore: ''
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.image || '',
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Fetch products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await retryOperation(async () => {
          const result = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (result.error) throw result.error;
          return result;
        });

        // Process products to ensure correct typing
        const processedProducts = (data || []).map((productData: any) => {
          let product = productData as Product;
          if (product.carbon_footprint_breakdown && typeof product.carbon_footprint_breakdown === 'object') {
            product.carbon_footprint_breakdown = product.carbon_footprint_breakdown as Product['carbon_footprint_breakdown'];
          }
          return product;
        });
        
        setProducts(processedProducts);
        setFilteredProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please check your internet connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    // Set up real-time subscription
    const channel = supabase
      .channel('products')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => 
              prev.map(p => p.id === payload.new.id ? payload.new as Product : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Apply filters when products or filters change
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedFilters.category) {
      result = result.filter(p => 
        p.category?.toLowerCase() === selectedFilters.category.toLowerCase()
      );
    }
    
    // Apply price range filter
    if (selectedFilters.priceRange) {
      const [min, max] = selectedFilters.priceRange.split('-').map(Number);
      result = result.filter(p => p.price >= min && p.price <= max);
    }
    
    // Apply eco-score filter
    if (selectedFilters.ecoScore) {
      const [minScore, maxScore] = selectedFilters.ecoScore.split('-').map(Number);
      result = result.filter(p => {
        const ecoScore = calculateEcoScoreForProduct(p) as any;
        const score = ecoScore.total || ecoScore.totalScore || 50;
        return score >= minScore && score <= maxScore;
      });
    }
    
    setFilteredProducts(result);
  }, [products, selectedFilters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const priceRanges = [
    { id: '0-500', label: 'Under ₹500' },
    { id: '500-1000', label: '₹500 - ₹1000' },
    { id: '1000-2000', label: '₹1000 - ₹2000' },
    { id: '2000-5000', label: 'Over ₹2000' }
  ];

  const ecoScoreRanges = [
    { id: '80-100', label: 'A+ to A (80-100)', grade: 'A+' },
    { id: '70-79', label: 'B (70-79)', grade: 'B' },
    { id: '60-69', label: 'C (60-69)', grade: 'C' },
    { id: '50-59', label: 'D (50-59)', grade: 'D' },
    { id: '0-49', label: 'E to F (0-49)', grade: 'F' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sorting */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sustainable Products</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{filteredProducts.length} items</span>
              <select 
                className="border rounded-md px-3 py-2"
                value={selectedFilters.priceRange}
                onChange={(e) => setSelectedFilters(prev => ({
                  ...prev,
                  priceRange: e.target.value
                }))}
              >
                <option value="">Sort by: Best Match</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="md:col-span-1 space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        type="radio"
                        id={`cat-${category}`}
                        name="category"
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                        checked={selectedFilters.category === category}
                        onChange={() => setSelectedFilters(prev => ({
                          ...prev,
                          category: prev.category === category ? '' : category
                        }))}
                      />
                      <label 
                        htmlFor={`cat-${category}`} 
                        className="ml-2 text-sm text-gray-700 capitalize"
                      >
                        {category.toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <div key={range.id} className="flex items-center">
                      <input
                        type="radio"
                        id={range.id}
                        name="priceRange"
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                        checked={selectedFilters.priceRange === range.id}
                        onChange={() => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: prev.priceRange === range.id ? '' : range.id
                        }))}
                      />
                      <label 
                        htmlFor={range.id} 
                        className="ml-2 text-sm text-gray-700"
                      >
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Eco-Score</h3>
                <div className="space-y-2">
                  {ecoScoreRanges.map(range => (
                    <div key={range.id} className="flex items-center">
                      <input
                        type="radio"
                        id={range.id}
                        name="ecoScore"
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                        checked={selectedFilters.ecoScore === range.id}
                        onChange={() => setSelectedFilters(prev => ({
                          ...prev,
                          ecoScore: prev.ecoScore === range.id ? '' : range.id
                        }))}
                      />
                      <label 
                        htmlFor={range.id} 
                        className="ml-2 text-sm text-gray-700 flex items-center"
                      >
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          range.grade === 'A+' ? 'bg-green-500' :
                          range.grade === 'B' ? 'bg-yellow-500' :
                          range.grade === 'C' ? 'bg-orange-500' :
                          range.grade === 'D' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></span>
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedFilters({
                  category: '',
                  priceRange: '',
                  ecoScore: ''
                })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
            
            {/* Product Grid */}
            <div className="md:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-2 text-gray-500">
                    {products.length === 0 
                      ? 'No products available. Check back later!' 
                      : 'Try adjusting your filters.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id}>
                      <ProductCard 
                        product={product}
                        className="cursor-pointer group"
                        onClick={() => navigate(`/product/${product.id}`)}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
