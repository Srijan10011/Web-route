import React, { useState, useEffect } from 'react';
import { Leaf, User, ShoppingCart } from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
  setModal: (modal: 'login' | 'signup' | null) => void;
  session: Session | null;
  cart: any[];
}

export default function Header({ currentPage = 'home', setCurrentPage, setModal, session, cart }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setIsAdmin(false);
        } else if (data) {
          setIsAdmin(data.role === 'admin');
        }
      } else {
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [session]);
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
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

          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </nav>
    </header>
  );
}