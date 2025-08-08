import React from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface CartProps {
  cart: any[];
  setCurrentPage: (page: string) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
}

export default function Cart({ cart, setCurrentPage, updateCartQuantity, removeFromCart }: CartProps) {
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart ({cart.length} items)</h1>
          <button onClick={() => setCart([])} className="text-gray-500 hover:text-gray-700">Clear Cart</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden p-8">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal ({cart.length} items)</p>
                <p className="font-semibold">${totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping</p>
                <p className="font-semibold">Free</p>
              </div>
              <div className="flex justify-between border-t pt-4">
                <p className="text-xl font-bold">Total</p>
                <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => setCurrentPage('checkout')} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold text-lg">
              Proceed to Checkout &rarr;
            </button>
            <button onClick={() => setCurrentPage('shop')} className="w-full mt-4 text-center text-gray-600 hover:text-gray-800">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
