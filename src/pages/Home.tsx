import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FeaturedProducts from '../components/FeaturedProducts';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

interface HomeProps {
  setSelectedProductId: (id: number | null) => void;
  addToCart: (product: any) => void;
  setModal: (modal: 'login' | 'signup' | null) => void;
  session: any;
}

export default function Home({ setSelectedProductId, addToCart, setModal, session }: HomeProps) {
  const navigate = useNavigate();
  return (
    <>
      <Hero navigate={navigate} setModal={setModal} session={session} />
      <Features />
      <FeaturedProducts setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
      <Testimonials />
      <Newsletter />
    </>
  );
}
