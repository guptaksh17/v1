
import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ThreeHeroBanner from '../components/ThreeHeroBanner';
import ProductShowcase from '../components/ProductShowcase';
import PromotionalTiles from '../components/PromotionalTiles';
import ImpactSection from '../components/ImpactSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ThreeHeroBanner />
      <ProductShowcase />
      <PromotionalTiles />
      <ImpactSection />
    </div>
  );
};

export default Index;
