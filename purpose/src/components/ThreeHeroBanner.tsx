
import React from 'react';
import ThreeScene from './ThreeScene';
import { Link } from 'react-router-dom';

const ThreeHeroBanner = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#0071CE] via-blue-600 to-blue-800 text-white py-16 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Shop the Future.
              <br />
              <span className="text-[#8BC34A]">Sustainably Verified.</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-2xl opacity-90">
              Experience next-generation retail with AI-powered sustainability insights 
              and blockchain-verified ethical products.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/product/organic-cotton-tshirt"
                className="bg-[#8BC34A] hover:bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-block text-center"
              >
                Explore 3D Shopping
              </Link>
              <Link 
                to="/my-impact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#0071CE] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-block text-center"
              >
                View Impact Dashboard
              </Link>
            </div>
          </div>
          
          {/* Right side - Three.js Scene */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              <ThreeScene />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeHeroBanner;
