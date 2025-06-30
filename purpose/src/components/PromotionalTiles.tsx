
import React from 'react';

const PromotionalTiles = () => {
  const tiles = [
    {
      title: "Offset Your Purchase",
      description: "Automatically neutralize your carbon footprint",
      color: "bg-[#8BC34A]",
      icon: "🌱"
    },
    {
      title: "Track Your Impact",
      description: "See real-time sustainability metrics",
      color: "bg-[#0071CE]",
      icon: "📊"
    },
    {
      title: "Verified Suppliers",
      description: "Shop from blockchain-verified ethical brands",
      color: "bg-purple-600",
      icon: "✅"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={`${tile.color} rounded-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-xl`}
            >
              <div className="text-4xl mb-4">{tile.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{tile.title}</h3>
              <p className="text-lg opacity-90">{tile.description}</p>
              <div className="mt-6">
                <span className="inline-flex items-center text-white hover:text-gray-200 font-semibold">
                  Learn More →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionalTiles;
