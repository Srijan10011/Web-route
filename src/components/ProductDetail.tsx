import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId === null) {
        setLoading(false);
        setError("No product ID provided.");
        return;
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }
        setProduct(data as Product);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
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
