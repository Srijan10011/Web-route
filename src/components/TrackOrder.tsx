import React, { useState } from 'react';
import { PackageSearch, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useOrderTrackingQuery } from '../lib/utils';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Use React Query for data fetching with automatic refetching
  const { 
    data: order, 
    isLoading: orderLoading, 
    error: orderError,
    refetch: refetchOrder 
  } = useOrderTrackingQuery(orderId);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus(null);
    setErrorMessage(null);
    setIsTracking(true);

    if (!orderId) {
      setErrorMessage('Please enter an Order ID.');
      setIsTracking(false);
      return;
    }

    try {
      await refetchOrder();
    } catch (error) {
      console.error('Error tracking order:', error);
      setErrorMessage('An error occurred while tracking your order. Please try again later.');
    } finally {
      setIsTracking(false);
    }
  };

  // Update order status when data changes
  React.useEffect(() => {
    if (order) {
      setOrderStatus(`Your order status is: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
      setErrorMessage(null);
    }
  }, [order]);

  // Handle errors
  React.useEffect(() => {
    if (orderError) {
      if (orderError.message?.includes('PGRST116') || orderError.message?.includes('No rows found')) {
        setErrorMessage('Order ID not found. Please check your ID and try again.');
      } else {
        setErrorMessage('An error occurred while tracking your order. Please try again later.');
      }
      setOrderStatus(null);
    }
  }, [orderError]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <PackageSearch className="mx-auto h-12 w-auto text-green-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Track Your Order
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your order ID below to get the latest status.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleTrackOrder}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="order-id" className="sr-only">
                Order ID
              </label>
              <input
                id="order-id"
                name="order-id"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && (
            <p className="mt-2 text-center text-sm text-red-600">{errorMessage}</p>
          )}
          {orderStatus && (
            <p className="mt-2 text-center text-sm text-green-600 font-medium">{orderStatus}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Track Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
