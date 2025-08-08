import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, RefreshCw } from 'lucide-react';
import { supabase, retryOperation } from '../lib/supabaseClient';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge: string | null;
  badgeColor: string | null;
  details?: string[];
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">({rating}) {reviews} reviews</span>
    </div>
  );
}

interface ProductDetailProps {
  productId: number | null;
  setCurrentPage: (page: string) => void;
  addToCart: (product: any) => void;
}

export default function ProductDetail({ productId, setCurrentPage, addToCart }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (productId === null) {
      setLoading(false);
      setError("No product ID provided.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }
        return data;
      });

      setProduct(data as Product);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Product</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={fetchProduct}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setCurrentPage('shop')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist or is unavailable.</p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('shop')}
          className="mb-8 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          &larr; Back to Shop
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:flex">
          <div className="lg:w-1/2">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="lg:w-1/2 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <StarRating rating={product.rating} reviews={product.reviews} />
              {product.badge && (
                <span className={`ml-4 ${product.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                  {product.badge}
                </span>
              )}
            </div>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">{product.description}</p>
            <p className="text-green-600 text-3xl font-bold mb-6">${product.price}</p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Details</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {product.details?.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>

            <button onClick={() => addToCart(product)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 transition-colors transform hover:scale-105">
              <ShoppingCart className="h-6 w-6" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
