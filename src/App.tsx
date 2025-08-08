import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import FeaturedProducts from './components/FeaturedProducts';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Shop from './components/Shop';
import Contact from './components/Contact';
import Login from './components/Login';
import Signup from './components/Signup';
import TrackOrder from './components/TrackOrder';
import ProductDetail from './components/ProductDetail';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPage from './components/AdminPage';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [modal, setModal] = useState<'login' | 'signup' | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // Check if user is logged in and if they have a profile
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (error && error.code === 'PGRST116') { // PGRST116 means no rows found
          // Profile does not exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: '', // Default empty, user can fill later
              last_name: '',  // Default empty, user can fill later
              role: 'user',
            });

          if (insertError) {
            console.error('Error creating profile on first login:', insertError);
          }
        } else if (error) {
          console.error('Error checking profile on auth state change:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <About setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'shop':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Shop setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'contact':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Contact />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'track-order':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <TrackOrder />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'product-detail':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <ProductDetail productId={selectedProductId} setCurrentPage={setCurrentPage} addToCart={addToCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'profile':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Profile session={session} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'cart':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Cart cart={cart} setCurrentPage={setCurrentPage} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'checkout':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Checkout cart={cart} setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'admin':
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <AdminPage setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
      case 'home':
      default:
        return (
          <div>
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setModal={setModal} session={session} cart={cart} />
            <Hero setCurrentPage={setCurrentPage} setModal={setModal} session={session} />
            <Features />
            <FeaturedProducts setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
            <Testimonials />
            <Newsletter />
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        {renderPage()}
        {modal === 'login' && <Login setModal={setModal} />}
        {modal === 'signup' && <Signup setModal={setModal} />}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;