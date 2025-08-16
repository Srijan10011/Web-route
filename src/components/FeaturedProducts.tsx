import React, { useMemo } from 'react';
import { useFeaturedProductsQuery } from '../lib/utils';
import { useProductsRatingsQuery } from '../lib/productRatingHooks';
import StarRating from './ui/StarRating';

function ProductCard({ product, onProductClick, addToCart, rating }: { 
  product: any; 
  onProductClick: (id: number) => void; 
  addToCart: (product: any) => void;
  rating?: { averageRating: number; reviewCount: number };
}) {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 text-left w-full"
    >
      <button onClick={() => onProductClick(product.id)} className="w-full">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span className={`absolute top-4 left-4 ${product.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {product.badge}
            </span>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <StarRating 
              rating={rating?.averageRating || 0} 
              readonly 
              size="sm" 
              showValue 
              reviewCount={rating?.reviewCount || 0}
            />
          </div>
        </div>
      </button>
      <div className="p-6 pt-0">
        <button 
          onClick={() => addToCart(product)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ setCurrentPage, setSelectedProductId, addToCart }: { setCurrentPage: (page: string) => void; setSelectedProductId: (id: number) => void; addToCart: (product: any) => void }) {
  const { data: products = [], isLoading: loading, error } = useFeaturedProductsQuery();

  // Get product IDs for rating queries
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  
  // Fetch ratings for all featured products
  const { 
    data: productRatings = [], 
    isLoading: ratingsLoading 
  } = useProductsRatingsQuery(productIds);

  // Create a map of product ratings for easy lookup
  const ratingsMap = useMemo(() => {
    const map = new Map();
    productRatings.forEach(rating => {
      map.set(rating.productId, rating);
    });
    return map;
  }, [productRatings]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p>Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p>Error loading products: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular mushroom products, carefully selected for
            quality and freshness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products && products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              rating={ratingsMap.get(product.id)}
              onProductClick={(id) => {
                setSelectedProductId(id);
                setCurrentPage('product-detail');
              }} 
              addToCart={addToCart} 
            />
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => setCurrentPage('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}