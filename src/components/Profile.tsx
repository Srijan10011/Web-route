import React, { useState } from 'react';
import { User, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useProfileQuery, useUserOrdersQuery } from '../lib/utils';

interface ProfileProps {
  session: any;
}

export default function Profile({ session }: ProfileProps) {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Use React Query for data fetching with automatic refetching
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useProfileQuery(session?.user?.id);

  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useUserOrdersQuery(session?.user?.id);

  // Manual refetch functions
  const handleRefetchProfile = async () => {
    setLoadingProfile(true);
    await refetchProfile();
    setLoadingProfile(false);
  };

  const handleRefetchOrders = async () => {
    setLoadingOrders(true);
    await refetchOrders();
    setLoadingOrders(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userEmail = session.user?.email || 'N/A';
  const registrationDate = session.user?.created_at ? new Date(session.user.created_at).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            {profileLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            ) : profileError ? (
              <div className="text-center">
                <p className="text-red-600 mb-2">Failed to load profile</p>
                <button
                  onClick={handleRefetchProfile}
                  disabled={loadingProfile}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {loadingProfile ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            ) : profile ? (
              <p className="text-gray-600">Welcome, {profile.first_name} {profile.last_name}!</p>
            ) : (
              <p className="text-gray-600">Manage your account details and view your activity.</p>
            )}
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profileLoading ? 'Loading...' : profile ? `${profile.first_name} ${profile.last_name}` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-lg font-semibold text-gray-900">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">{registrationDate}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order History</h2>
            {ordersLoading ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 mb-4">Loading orders...</p>
                <p className="text-gray-500 text-sm">This may take a few moments</p>
              </div>
            ) : ordersError ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-red-600 mb-4">Failed to load orders</p>
                <button
                  onClick={handleRefetchOrders}
                  disabled={loadingOrders}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {loadingOrders ? 'Retrying...' : 'Retry Loading Orders'}
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found. Start shopping now!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-lg">Order #{order.order_number}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Date: {new Date(order.order_date).toLocaleDateString()}</p>
                    <p className="text-gray-800 font-bold text-xl mb-2">Total: ${parseFloat(order.total_amount).toFixed(2)}</p>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="font-medium text-gray-700">Items:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, idx: number) => (
                            <li key={idx}>{item.name} (x{item.quantity}) - ${item.price.toFixed(2)}</li>
                          ))
                        ) : (
                          <li>No items listed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <button 
              onClick={() => console.log('Edit Profile clicked')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}