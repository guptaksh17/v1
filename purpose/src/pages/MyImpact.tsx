
import React from 'react';
import Header from '../components/Header';
import { Leaf, Award, TreePine, Globe, TrendingUp, Shield } from 'lucide-react';

const MyImpact = () => {
  const impactStats = [
    {
      icon: Leaf,
      title: "CO₂ Saved",
      value: "127.3 kg",
      description: "Equivalent to planting 6 trees",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Verified Purchases",
      value: "42",
      description: "Blockchain-verified transactions",
      color: "text-blue-600"
    },
    {
      icon: Award,
      title: "Impact Score",
      value: "8.7/10",
      description: "Above average sustainability",
      color: "text-purple-600"
    },
    {
      icon: Globe,
      title: "Ethical Brands",
      value: "23",
      description: "Different sustainable brands supported",
      color: "text-orange-600"
    }
  ];

  const badges = [
    { name: "Eco Warrior", description: "100+ sustainable purchases", earned: true },
    { name: "Carbon Neutral", description: "Offset 100kg+ CO₂", earned: true },
    { name: "Ethical Shopper", description: "Shop from 20+ verified brands", earned: true },
    { name: "Green Pioneer", description: "First 1000 platform users", earned: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Impact Dashboard</h1>
          <p className="text-gray-600">Track your positive environmental and social impact</p>
        </div>
        
        {/* Impact Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <h3 className="ml-3 font-semibold text-gray-900">{stat.title}</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          ))}
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Monthly CO₂ Savings</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-[#8BC34A] mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would go here</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Impact Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Carbon Offset</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-[#8BC34A] h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ethical Sourcing</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-[#0071CE] h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recyclable Materials</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Badges Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Achievement Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${badge.earned ? 'border-[#8BC34A] bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${badge.earned ? 'bg-[#8BC34A]' : 'bg-gray-300'}`}>
                    <Award className={`h-6 w-6 ${badge.earned ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <h4 className={`font-semibold mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>{badge.name}</h4>
                  <p className={`text-xs ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyImpact;
