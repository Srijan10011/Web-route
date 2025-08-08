import React from 'react';
import { Star } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Premium Dried Oyster Mushrooms',
    description: 'Hand-selected oyster mushrooms, carefully dried to preserve nutrients and flavor.',
    price: 24.99,
    rating: 4.9,
    reviews: 127,
    image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    badge: 'Bestseller',
    badgeColor: 'bg-orange-500'
  },
  {
    id: 2,
    name: 'Shiitake Mushroom Spawn Seeds',
    description: 'Premium quality shiitake spawn seeds for home cultivation with detailed instructions.',
    price: 18.99,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    badge: 'New',
    badgeColor: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Mushroom Cultivation Balls',
    description: 'Complete cultivation kit in convenient ball form. Just add water and watch grow!',
    price: 32.99,
    rating: 5.0,
    reviews: 203,
    image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    badge: null,
    badgeColor: ''
  }
];

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">({rating}) {reviews} reviews</span>
    </div>
  );
}

function ProductCard({ product, onProductClick, addToCart }: { product: any; onProductClick: (id: number) => void; addToCart: (product: any) => void }) {
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
            <StarRating rating={product.rating} reviews={product.reviews} />
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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onProductClick={(id) => {
              setSelectedProductId(id);
              setCurrentPage('product-detail');
            }} addToCart={addToCart} />
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