import React, { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../lib/supabaseClient';
import { useProfileQuery } from '../lib/utils';
import { ShoppingCart, User, Menu, X, Wifi, WifiOff, Leaf } from 'lucide-react';

interface HeaderProps {
  currentPage?: string;
  setCurrentPage: (page: string) => void;
  setModal: (modal: 'login' | 'signup' | null) => void;
  session: any;
  cart: any[];
}

export default function Header({ currentPage = 'home', setCurrentPage, setModal, session, cart }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use React Query for admin status with automatic refetching
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useProfileQuery(session?.user?.id);

  // Update admin status when profile changes
  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [profile]);

  // Check connection status periodically
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const { isConnected: connected } = await checkConnection();
        setIsConnected(connected);
      } catch (error) {
        console.error('Connection check failed:', error);
        setIsConnected(false);
      }
    };

    // Check immediately
    checkConnectionStatus();

    // Check every 2 minutes
    const interval = setInterval(checkConnectionStatus, 120000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Add this function to check for guest session
  const hasGuestSession = () => {
    const sessionsData = localStorage.getItem('guestSessions');
    if (sessionsData) {
      const sessions = JSON.parse(sessionsData);
      // Check if any session is still valid
      const validSessions = sessions.filter((session: any) => 
        session.expiresAt > Date.now()
      );
      return validSessions.length > 0;
    }
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentPage?.('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">FreshShroom</span>
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => setCurrentPage?.('home')}
                className={`${currentPage === 'home' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage?.('shop')}
                className={`${currentPage === 'shop' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors`}
              >
                Shop
              </button>
              <button 
                onClick={() => setCurrentPage?.('about')}
                className={`${currentPage === 'about' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors`}
              >
                About
              </button>
              <button 
                onClick={() => setCurrentPage?.('contact')}
                className={`${currentPage === 'contact' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors`}
              >
                Contact
              </button>
              {session && isAdmin && (
                <button 
                  onClick={() => setCurrentPage?.('admin')}
                  className={`${currentPage === 'admin' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors`}
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
            
            {session ? (
              <>
                {setCurrentPage && (
                  <button
                    onClick={() => setCurrentPage('profile')}
                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                  >
                    <User className="h-6 w-6" />
                    <span className="hidden sm:inline">Profile</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage?.('cart')}
                  className="relative text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setModal('login')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => setModal('signup')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Signup
                </button>
                <button
                  onClick={() => setCurrentPage?.('cart')}
                  className="relative text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </>
            )}
            {!session && hasGuestSession() && (
              <button
                onClick={() => setCurrentPage('guestOrder')}
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Order
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <button 
                onClick={() => {
                  setCurrentPage?.('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === 'home' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 block px-3 py-2 text-base font-medium transition-colors`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setCurrentPage?.('shop');
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === 'shop' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 block px-3 py-2 text-base font-medium transition-colors`}
              >
                Shop
              </button>
              <button 
                onClick={() => {
                  setCurrentPage?.('about');
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === 'about' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 block px-3 py-2 text-base font-medium transition-colors`}
              >
                About
              </button>
              <button 
                onClick={() => {
                  setCurrentPage?.('contact');
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === 'contact' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 block px-3 py-2 text-base font-medium transition-colors`}
              >
                Contact
              </button>
              {session && isAdmin && (
                <button 
                  onClick={() => {
                    setCurrentPage?.('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`${currentPage === 'admin' ? 'text-green-600' : 'text-gray-600'} hover:text-green-700 block px-3 py-2 text-base font-medium transition-colors`}
                >
                  Admin
                </button>
              )}
              {!session && hasGuestSession() && (
                <button
                  onClick={() => {
                    setCurrentPage('guestOrder');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-orange-600 block px-3 py-2 text-base font-medium transition-colors"
                >
                  My Order
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}