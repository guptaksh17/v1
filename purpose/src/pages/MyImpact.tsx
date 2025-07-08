import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Leaf, Award, TreePine, Globe, TrendingUp, Shield, ShoppingCart, DollarSign, Users, Star, Loader2 } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserProgress, calculateSustainabilityImpact, UserProgress, checkAndAwardBadges, USER_LEVELS } from '@/lib/gamification';
import { toast } from 'react-hot-toast';

interface ImpactData {
  co2Saved: number;
  treesPlanted: number;
  verifiedPurchases: number;
  impactScore: number;
  ethicalBrands: number;
  totalOrders: number;
  totalSpent: number;
  sustainabilityScore: number;
  carbonOffset: number;
  ecoFriendlyRate: number;
  brandDiversity: number;
  badges: any[];
  monthlyData: { month: string; co2: number }[];
}

const MyImpact = () => {
  const user = useUser();
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadImpactData();
    }
  }, [user]);

  const loadImpactData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load user progress using the gamification system
      const progress = await getUserProgress(user.id);
      setUserProgress(progress);

      // Check and award badges based on current achievements
      if (progress) {
        const newBadges = await checkAndAwardBadges(user.id, progress);
        if (newBadges.length > 0) {
          console.log('New badges unlocked:', newBadges.map(b => b.name));
          toast.success(`🎉 You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`);
          
          // Reload progress to get updated badges
          const updatedProgress = await getUserProgress(user.id);
          setUserProgress(updatedProgress);
        }
      }

      // Load orders for impact calculations
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        return;
      }

      console.log('Orders loaded:', orders);

      // Calculate impact metrics
      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + ((order.price || 0) * (order.quantity || 1)), 0) || 0;
      
      // Calculate CO2 saved - give credit for all orders since they're from sustainable marketplace
      const co2Saved = orders?.reduce((sum, order) => {
        // Base CO2 saved per order (since all products are sustainable)
        const baseCO2 = 3.5; // kg CO2 saved per sustainable purchase
        
        // Additional bonus for high eco-score products
        const ecoScore = order.eco_score || 0;
        const ecoBonus = (baseCO2 * ecoScore) / 100;
        
        const totalCO2 = baseCO2 + ecoBonus;
        console.log(`Order ${order.id}: base=${baseCO2}kg, eco_bonus=${ecoBonus}kg, total=${totalCO2}kg`);
        
        return sum + totalCO2;
      }, 0) || 0;

      console.log(`Total CO2 saved: ${co2Saved}kg from ${totalOrders} orders`);

      // Calculate trees planted (1 tree per 22kg CO2)
      const treesPlanted = Math.floor(co2Saved / 22);

      // Calculate eco-friendly rate - consider all orders as eco-friendly since they're from sustainable marketplace
      const ecoFriendlyOrders = orders?.filter(order => {
        const ecoScore = order.eco_score || 0;
        // Consider orders with eco_score > 30 as highly eco-friendly, but all orders contribute
        return ecoScore > 30;
      }).length || 0;
      
      // Calculate rate based on highly eco-friendly orders, but give credit for all
      const ecoFriendlyRate = totalOrders > 0 ? Math.min(1, (ecoFriendlyOrders + totalOrders * 0.3) / totalOrders) : 0;

      // Calculate brand diversity
      const uniqueBrands = new Set(orders?.map(order => order.brand || 'Unknown').filter(Boolean)).size;
      const brandDiversity = totalOrders > 0 ? Math.min(1, uniqueBrands / Math.max(totalOrders, 1)) : 0;

      // Calculate impact score (0-10 scale)
      const impactScore = Math.min(10, 
        (ecoFriendlyRate * 4) + 
        (brandDiversity * 3) + 
        (Math.min(1, totalOrders / 10) * 3)
      );

      // Generate monthly data
      const monthlyData = generateMonthlyData(orders || []);

      const impactData: ImpactData = {
        co2Saved,
        treesPlanted,
        verifiedPurchases: totalOrders,
        impactScore,
        ethicalBrands: uniqueBrands,
        totalOrders,
        totalSpent,
        sustainabilityScore: impactScore * 10,
        carbonOffset: co2Saved,
        ecoFriendlyRate,
        brandDiversity,
        badges: progress?.badges || [],
        monthlyData
      };

      console.log('Impact data calculated:', impactData);
      console.log('User badges:', progress?.badges);
      console.log('Unlocked badges:', progress?.badges?.filter(b => b.unlocked));
      
      // Use totalSpent for points calculation if needed, but use progress.totalPoints for level
      const totalPoints = progress?.totalPoints || 0;
      // Calculate the correct user level based on total points
      let newLevel = 1;
      for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
        if (totalPoints >= USER_LEVELS[i].minPoints) {
          newLevel = USER_LEVELS[i].level;
          break;
        }
      }

      // Update user progress with calculated sustainability metrics and correct level
      if (user && progress) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            carbon_offset: co2Saved,
            trees_planted: treesPlanted,
            sustainability_score: impactScore * 10,
            orders_completed: totalOrders,
            total_spent: totalSpent,
            level: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating user progress:', updateError);
        } else {
          console.log('✅ Updated user progress with sustainability metrics and level');
        }
      }
      
      setImpactData(impactData);

    } catch (error) {
      console.error('Error loading impact data:', error);
      toast.error('Failed to load impact data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (orders: any[]) => {
    const months = [];
    const now = new Date();
    
    console.log('Generating monthly data for orders:', orders.length);
    console.log('Sample order dates:', orders.slice(0, 3).map(o => o.created_at));
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        const isMatch = orderDate.getMonth() === date.getMonth() && 
                       orderDate.getFullYear() === date.getFullYear();
        return isMatch;
      });
      
      // Use same CO2 calculation as main impact data
      const co2 = monthOrders.reduce((sum, order) => {
        const baseCO2 = 3.5; // kg CO2 saved per sustainable purchase
        const ecoScore = order.eco_score || 0;
        const ecoBonus = (baseCO2 * ecoScore) / 100;
        return sum + baseCO2 + ecoBonus;
      }, 0);
      
      months.push({ month: monthName, co2 });
      
      console.log(`${monthName}: ${monthOrders.length} orders, ${co2.toFixed(1)}kg CO2`);
    }
    
    // If no orders found in any month, distribute all orders to current month
    const totalOrdersInMonths = months.reduce((sum, month) => sum + month.co2, 0);
    if (totalOrdersInMonths === 0 && orders.length > 0) {
      console.log('No orders found in monthly data, distributing to current month');
      const currentMonthIndex = months.length - 1;
      const totalCo2 = orders.reduce((sum, order) => {
        const baseCO2 = 3.5;
        const ecoScore = order.eco_score || 0;
        const ecoBonus = (baseCO2 * ecoScore) / 100;
        return sum + baseCO2 + ecoBonus;
      }, 0);
      months[currentMonthIndex].co2 = totalCo2;
      console.log(`Distributed ${totalCo2.toFixed(1)}kg CO2 to current month`);
    }
    
    return months;
  };

  const impactStats = impactData ? [
    {
      icon: Leaf,
      title: "CO₂ Saved",
      value: `${impactData.co2Saved} kg`,
      description: `Equivalent to planting ${impactData.treesPlanted} trees`,
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Verified Purchases",
      value: impactData.verifiedPurchases.toString(),
      description: "Blockchain-verified transactions",
      color: "text-blue-600"
    },
    {
      icon: Award,
      title: "Impact Score",
      value: `${impactData.impactScore}/10`,
      description: impactData.impactScore >= 8 ? "Excellent sustainability" : 
                   impactData.impactScore >= 6 ? "Above average sustainability" : 
                   "Good start on sustainability",
      color: "text-purple-600"
    },
    {
      icon: Globe,
      title: "Ethical Brands",
      value: impactData.ethicalBrands.toString(),
      description: "Different sustainable brands supported",
      color: "text-orange-600"
    }
  ] : [];

  const getImpactLevel = () => {
    if (!impactData) return "Beginner";
    if (impactData.impactScore >= 9) return "Eco Champion";
    if (impactData.impactScore >= 7) return "Green Guardian";
    if (impactData.impactScore >= 5) return "Sustainability Seeker";
    return "Eco Explorer";
  };

  const getImpactColor = () => {
    const level = getImpactLevel();
    switch (level) {
      case "Eco Champion": return "text-emerald-600";
      case "Green Guardian": return "text-green-600";
      case "Sustainability Seeker": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Impact Dashboard</h1>
          <p className="text-gray-600">Track your positive environmental and social impact</p>
          {impactData && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Star className={`h-6 w-6 ${getImpactColor()}`} />
                <div>
                  <p className="text-sm text-gray-600">Your Impact Level</p>
                  <p className={`text-lg font-semibold ${getImpactColor()}`}>{getImpactLevel()}</p>
                </div>
              </div>
            </div>
          )}
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
            <div className="mb-4">
              <p className="text-sm text-gray-600">Your environmental impact over the last 6 months</p>
            </div>
            <div className="h-64 flex items-end justify-between gap-3 relative">
              {/* Grid lines for better readability */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 25, 50, 75, 100].map((percent) => (
                  <div key={percent} className="border-t border-gray-100"></div>
                ))}
              </div>
              
              {impactData?.monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all duration-300 hover:from-green-700 hover:to-green-500 cursor-pointer shadow-sm relative"
                    style={{ height: `${Math.max(20, (data.co2 / 15) * 100)}%` }}
                  ></div>
                  
                  {/* Data point label */}
                  <p className="text-xs text-gray-600 mt-2 font-medium">{data.month}</p>
                  <p className="text-xs font-bold text-green-600">{data.co2.toFixed(1)}kg</p>
                  
                  {/* Enhanced Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-semibold">{data.month}</div>
                    <div>{data.co2.toFixed(1)}kg CO₂ saved</div>
                    <div className="text-green-400">
                      {data.co2 > 0 ? `~${Math.floor(data.co2 / 22)} trees planted` : 'No activity'}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ))}
              
              {/* Dots positioned relative to chart container */}
              {impactData?.monthlyData.map((data, index) => (
                <div 
                  key={`dot-${index}`}
                  className="absolute w-4 h-4 bg-green-600 border-2 border-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer group"
                  style={{ 
                    bottom: `${(data.co2 / 15) * 100}%`,
                    left: `${(index / (impactData.monthlyData.length - 1)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Tooltip for dots */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-semibold">{data.month}</div>
                    <div>{data.co2.toFixed(1)}kg CO₂ saved</div>
                    <div className="text-green-400">
                      {data.co2 > 0 ? `~${Math.floor(data.co2 / 22)} trees planted` : 'No activity'}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ))}
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
                <span>15kg</span>
                <span>11.25kg</span>
                <span>7.5kg</span>
                <span>3.75kg</span>
                <span>0kg</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total CO₂ Saved:</span>
                <span className="font-semibold text-green-600">
                  {impactData?.monthlyData.reduce((sum, data) => sum + data.co2, 0).toFixed(1)}kg
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Equivalent Trees:</span>
                <span className="font-semibold text-green-600">
                  {Math.floor(impactData?.monthlyData.reduce((sum, data) => sum + data.co2, 0) / 22)} trees
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Impact Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Eco-Friendly Purchase Rate</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${Math.min(100, (impactData?.ecoFriendlyRate || 0) * 100)}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round((impactData?.ecoFriendlyRate || 0) * 100)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Brand Diversity</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${Math.min(100, (impactData?.brandDiversity || 0) * 100)}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round((impactData?.brandDiversity || 0) * 100)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Impact Score</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${(impactData?.impactScore || 0) * 10}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round((impactData?.impactScore || 0) * 10)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h3 className="ml-3 font-semibold text-gray-900">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{impactData?.totalOrders || 0}</p>
            <p className="text-sm text-gray-600">Sustainable purchases made</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <h3 className="ml-3 font-semibold text-gray-900">Total Spent</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">₹{(impactData?.totalSpent || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600">On sustainable products</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <TreePine className="h-8 w-8 text-emerald-600" />
              <h3 className="ml-3 font-semibold text-gray-900">Trees Planted</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{impactData?.treesPlanted || 0}</p>
            <p className="text-sm text-gray-600">Through your purchases</p>
          </div>
        </div>
        
        {/* Badges Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Achievement Badges</h3>
            {impactData?.badges && (
              <div className="text-sm text-gray-600">
                {impactData.badges.filter(b => b.unlocked).length} of {impactData.badges.length} unlocked
              </div>
            )}
          </div>
          
          {/* Badge Summary */}
          {impactData?.badges && impactData.badges.filter(b => b.unlocked).length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Your Achievements</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {impactData.badges
                  .filter(badge => badge.unlocked)
                  .slice(0, 5) // Show first 5 unlocked badges
                  .map((badge, index) => (
                    <div key={index} className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full text-xs">
                      <span>{badge.icon}</span>
                      <span className="text-green-700 font-medium">{badge.name}</span>
                    </div>
                  ))}
                {impactData.badges.filter(b => b.unlocked).length > 5 && (
                  <div className="text-xs text-green-600">
                    +{impactData.badges.filter(b => b.unlocked).length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {impactData?.badges.map((badge, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  badge.unlocked 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 shadow-sm' 
                    : 'border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    badge.unlocked ? 'bg-green-500 shadow-lg' : 'bg-gray-400'
                  }`}>
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <h4 className={`font-semibold mb-1 ${
                    badge.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className={`text-xs ${
                    badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                  {badge.unlocked ? (
                    <div className="mt-2 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                      <span>✓</span>
                      <span>Unlocked</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-400">
                      Locked
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!impactData?.badges || impactData.badges.length === 0) && (
              <div className="col-span-full text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No badges available yet. Keep making sustainable choices!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyImpact;
