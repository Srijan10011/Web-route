import React, { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../lib/supabaseClient';
import { useProfileQuery } from '../lib/utils';
import { Link } from 'react-router-dom';

import { ShoppingCart, User, Menu, X, Wifi, WifiOff, Leaf, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentPage?: string;
  setModal: (modal: 'login' | 'signup' | null) => void;
  session: any;
  cart: any[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({ currentPage = 'home', setModal, session, cart, theme, toggleTheme }: HeaderProps) {
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
    } else {
      window.location.href = '/';
    }
  };

  // Add this function to check for guest session
  const hasGuestSession = () => {
    const sessionsData = localStorage.getItem('guestSessions');
    if (sessionsData) {
      const sessions = JSON.parse(sessionsData);
      return sessions.length > 0; // Simply check if there are any sessions
    }
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">FreshShroom</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className={`${currentPage === '/' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors`}>
                Home
              </Link>
              <Link to="/shop" className={`${currentPage === '/shop' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors`}>
                Shop
              </Link>
              <Link to="/about" className={`${currentPage === '/about' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors`}>
                About
              </Link>
              <Link to="/contact" className={`${currentPage === '/contact' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors`}>
                Contact
              </Link>
              {session && isAdmin && (
                <Link to="/admin" className={`${currentPage === '/admin' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors`}>
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Sun className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </button>

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
                  <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1">
                    <User className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Link>
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
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setModal('signup')}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Signup
                  </button>
                  <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {!session && hasGuestSession() && (
                <Link to="/guestOrder" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 rounded-md text-sm font-medium">
                  My Order
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Sun className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </button>
              {session && (
                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mr-4">
                  <User className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
              )}
              <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mr-4">
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900  dark:hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`${currentPage === '/' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors`}>
                Home
              </Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className={`${currentPage === '/shop' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors`}>
                Shop
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`${currentPage === '/about' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors`}>
                About
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`${currentPage === '/contact' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors`}>
                Contact
              </Link>
              {!session && hasGuestSession() && (
                <Link to="/guestOrder" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 text-base font-medium transition-colors">
                  My Order
                </Link>
              )}
              {!session && (
                <>
                  <button 
                    onClick={() => {
                      setModal('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors"
>
                    Signup
                  </button>
                  <button 
                    onClick={() => {
                      setModal('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors"
                  >
                    Login
                  </button>
                </>
              )}
              {session && isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`${currentPage === '/admin' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'} hover:text-green-700 dark:hover:text-green-500 block px-3 py-2 text-base font-medium transition-colors`}>
                  Admin
                </Link>
              )}
              {session && (
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
