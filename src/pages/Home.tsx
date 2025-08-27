import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FeaturedProducts from '../components/FeaturedProducts';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: number | null) => void;
  addToCart: (product: any) => void;
  setModal: (modal: 'login' | 'signup' | null) => void;
  session: any;
}

export default function Home({ setCurrentPage, setSelectedProductId, addToCart, setModal, session }: HomeProps) {
  return (
    <>
      <Hero setCurrentPage={setCurrentPage} setModal={setModal} session={session} />
      <Features />
      <FeaturedProducts setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
      <Testimonials />
      <Newsletter />
    </>
  );
}
