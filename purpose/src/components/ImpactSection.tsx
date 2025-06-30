
import React from 'react';
import { Recycle, LeafyGreen } from 'lucide-react';

const ImpactSection = () => {
  const impactStats = [
    {
      icon: <Recycle className="h-8 w-8" />,
      value: "2,847",
      label: "kg CO₂ Saved",
      color: "text-[#8BC34A]"
    },
    {
      icon: <LeafyGreen className="h-8 w-8" />,
      value: "156",
      label: "Trees Planted",
      color: "text-green-600"
    },
    {
      icon: <div className="h-8 w-8 bg-[#0071CE] rounded-full flex items-center justify-center text-white font-bold text-sm">₹</div>,
      value: "₹45,892",
      label: "Donated to Causes",
      color: "text-[#0071CE]"
    },
    {
      icon: <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">♀</div>,
      value: "23",
      label: "Women-led Brands Supported",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Collective Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Together, we're making a real difference. See how your purchases contribute to positive change.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactStats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-[#8BC34A] to-green-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Track Your Personal Impact</h3>
            <p className="text-lg mb-6 opacity-90">
              Get detailed insights into your sustainability journey and earn rewards for conscious choices.
            </p>
            <button className="bg-white text-[#8BC34A] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200">
              View My Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
