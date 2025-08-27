import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileQuery, useUserAddressesQuery } from '../lib/utils';
import MapPickerModal from './MapPickerModal';
import PaymentGatewayDialog from './PaymentGatewayDialog';

interface CheckoutProps {
  cart: any[];
  setCurrentPage: (page: string) => void;
  session: any;
  clearCart: () => void | Promise<void>;
}

interface GuestSession {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  expiresAt: number;
  orderData: any;
}

export default function Checkout({ cart, setCurrentPage, session, clearCart }: CheckoutProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  // Get current user
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getCurrentUser();
  }, []);

  // Use React Query for data fetching with automatic refetching
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useProfileQuery(user?.id);

  const { 
    data: addressData, 
    isLoading: addressLoading, 
    error: addressError,
    refetch: refetchAddress 
  } = useUserAddressesQuery(user?.id);

  // Manual refetch functions
  const handleRefetchProfile = async () => {
    await refetchProfile();
  };

  const handleRefetchAddress = async () => {
    await refetchAddress();
  };

  // Get email directly from user object like profile does
  const userEmail = user?.email || '';

  // Then in your useEffect, prioritize profile data but fall back to user data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
    } else if (session?.user) {
      // Fallback to session user data
      setFirstName(session.user.user_metadata?.first_name || '');
      setLastName(session.user.user_metadata?.last_name || '');
      setEmail(session.user.email || '');
    }
  }, [profile, session]);

  // Load guest contact info from localStorage if not authenticated
  useEffect(() => {
    if (!session) { // Only for guest users
      const savedContactInfo = localStorage.getItem('guestContactInfo');
      if (savedContactInfo) {
        try {
          const parsedInfo = JSON.parse(savedContactInfo);
          setFirstName(parsedInfo.firstName || '');
          setLastName(parsedInfo.lastName || '');
          setEmail(parsedInfo.email || '');
          setPhone(parsedInfo.phone || '');
        } catch (e) {
          console.error("Error parsing guest contact info from localStorage", e);
          // Clear invalid data to prevent future errors
          localStorage.removeItem('guestContactInfo');
        }
      }
    }
  }, [session]); // Run when session changes

  useEffect(() => {
    if (addressData) {
        setPhone(addressData.phone || '');
        setAddress(addressData.address || '');
        setCity(addressData.city || '');
        setState(addressData.state || '');
        // Removed automatic location pre-fill as per user request
        // if (addressData.latitude && addressData.longitude) {
        //   setLocation(`${addressData.latitude}, ${addressData.longitude}`);
        // }
      }
    
  }, [addressData]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("You denied the request for Geolocation. To use this feature, please enable location services for this site in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out.");
              break;
            default:
              alert("An unknown error occurred.");
              break;
          }
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    // Step 1: Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
      alert('Please fill in all required fields.');
      return;
    }

    // Step 2: Validate location
    if (!location) {
      alert('Please click "Use my location" to proceed with the order.');
      return;
    }

    console.log('Setting showPaymentDialog to true');
    setShowPaymentDialog(true);
  };

  const handleEsewaPay = async () => {
    const orderDetails = {
      cart,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      location,
      totalPrice,
      session,
    };

    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    try {
      const response = await fetch('http://localhost:3001/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: (totalPrice + 5.99).toFixed(2),
          productId: 'EPAYTEST',
          successUrl: 'http://localhost:3001/verify-payment',
          failureUrl: 'http://localhost:3001/verify-payment',
        }),
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment');
    }
  };

  const handleSelectGateway = (gateway: string) => {
    setShowPaymentDialog(false);
    if (gateway === 'esewa') {
      handleEsewaPay();
    } else if (gateway === 'khalti') {
      // Handle Khalti payment
      console.log('Khalti payment selected');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                  <input type="email" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6 text-gray-500 dark:text-gray-400 text-base">+977</span>
                  <input 
                    type="tel" 
                    className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-12" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">City</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">State</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex space-x-2">
                  <button onClick={getLocation} className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm">
                    Use my location
                  </button>
                  <button onClick={() => setShowMapModal(true)} className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm">
                    Pick Location on Map
                  </button>
                  {location && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your location: {location}</p>}
                </div>
              </div>
            </div>
{showMapModal && (
                      <MapPickerModal
                        onClose={() => setShowMapModal(false)}
                        onLocationSelect={(lat, lng) => {
                          setLocation(`${lat}, ${lng}`);
                          setShowMapModal(false);
                        }}
                      />
                    )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0a2 2 0 012 2v3a2 2 0 012-2H7a2 2 0 01-2-2v-3a2 2 0 012-2h10zm-3 5a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Payment Method
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Credit/Debit Card</label>
                <div className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Secure payment form will be here.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                    <div>
                      <p className="text-gray-800 dark:text-white font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white">Rs {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-300">Subtotal</p>
                <p className="font-semibold text-gray-800 dark:text-white">Rs {totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-300">Shipping</p>
                <p className="font-semibold text-gray-800 dark:text-white">Rs 5.99</p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-gray-800 dark:text-white">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">Rs {(totalPrice + 5.99).toFixed(2)}</p>
            </div>
            <button onClick={handlePlaceOrder} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold text-lg transition-colors">
              Place Order - Rs {(totalPrice + 5.99).toFixed(2)}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">By placing your order, you agree to our terms and conditions.</p>
          </div>
        </div>
      </div>
      {showPaymentDialog && (
        <PaymentGatewayDialog 
          onClose={() => setShowPaymentDialog(false)} 
          onSelectGateway={handleSelectGateway} 
        />
      )}
    </div>
  );
}
