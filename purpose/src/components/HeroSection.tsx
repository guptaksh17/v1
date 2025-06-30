
import React from 'react';
import { Recycle, LeafyGreen } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#0071CE] to-blue-600 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="animate-pulse">
              <Recycle className="h-12 w-12 text-[#8BC34A]" />
            </div>
            <div className="animate-pulse animation-delay-200">
              <LeafyGreen className="h-12 w-12 text-[#8BC34A]" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Shop Sustainably.
            <br />
            <span className="text-[#8BC34A]">Verified by AI & Blockchain.</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Every purchase makes a difference. Track your impact, offset your carbon footprint, 
            and support ethical brands with blockchain-verified transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/shop"
              className="bg-[#8BC34A] hover:bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-block text-center"
            >
              Start Shopping Sustainably
            </Link>
            <Link 
              to="/my-impact"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-[#0071CE] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-block text-center"
            >
              Learn About Our Impact
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-bounce animation-delay-1000">
        <div className="bg-[#8BC34A] rounded-full p-3 opacity-20">
          <Recycle className="h-6 w-6" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce animation-delay-1500">
        <div className="bg-white rounded-full p-3 opacity-20">
          <LeafyGreen className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
