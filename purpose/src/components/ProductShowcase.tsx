import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/products';

const ProductShowcase = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Best for the Planet
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover products that make a positive impact on our environment, 
            verified through AI analysis and blockchain transparency.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard 
                  product={product}
                  onAddToCart={(product) => {
                    // TODO: Implement add to cart functionality
                    console.log('Add to cart from showcase:', product);
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            to="/shop"
            className="bg-[#0071CE] hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-block"
          >
            View All Sustainable Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
