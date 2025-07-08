import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp, 
  Leaf, 
  Trees, 
  Zap, 
  Target,
  Award,
  Crown,
  Flame,
  Users,
  ShoppingCart
} from 'lucide-react';
import { 
  UserProgress, 
  Badge, 
  Reward, 
  USER_LEVELS, 
  BADGES, 
  REWARDS,
  getUserProgress,
  addPoints,
  checkAndAwardBadges,
  getAvailableRewards,
  redeemReward,
  getUserLevelBenefits,
  calculateSustainabilityImpact
} from '@/lib/gamification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface GamificationDashboardProps {
  userId: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userId }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      const userProgress = await getUserProgress(userId);
      if (userProgress) {
        setProgress(userProgress);
        const rewards = await getAvailableRewards(userId, userProgress.currentPoints);
        setAvailableRewards(rewards);
        
        // Check for new badges
        const badges = await checkAndAwardBadges(userId, userProgress);
        if (badges.length > 0) {
          setNewBadges(badges);
          toast.success(`🎉 You earned ${badges.length} new badge${badges.length > 1 ? 's' : ''}!`);
          // Reload progress after badge awards
          const updatedProgress = await getUserProgress(userId);
          if (updatedProgress) {
            setProgress(updatedProgress);
            const updatedRewards = await getAvailableRewards(userId, updatedProgress.currentPoints);
            setAvailableRewards(updatedRewards);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
      toast.error('Failed to load your progress');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      const success = await redeemReward(userId, rewardId);
      if (success) {
        toast.success('Reward redeemed successfully!');
        loadUserProgress(); // Reload to update points
      } else {
        toast.error('Failed to redeem reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  const getCurrentLevel = () => {
    if (!progress) return USER_LEVELS[0];
    return USER_LEVELS.find(level => level.level === progress.level) || USER_LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    return USER_LEVELS.find(level => level.level === currentLevel.level + 1);
  };

  const getProgressToNextLevel = () => {
    if (!progress) return 0;
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;
    
    const currentLevel = getCurrentLevel();
    const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
    const userProgress = progress.totalPoints - currentLevel.minPoints;
    
    return Math.min(100, (userProgress / pointsNeeded) * 100);
  };

  const getUnlockedBadges = () => {
    if (!progress) return [];
    return progress.badges.filter(badge => badge.unlocked);
  };

  const getLockedBadges = () => {
    if (!progress) return BADGES;
    return progress.badges.filter(badge => !badge.unlocked);
  };

  const getBadgesByCategory = (category: string) => {
    const unlocked = getUnlockedBadges();
    return unlocked.filter(badge => badge.category === category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
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

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Rewards!</h2>
            <p className="text-gray-600 mb-6">Start earning points and unlock amazing rewards</p>
            <button 
              onClick={loadUserProgress}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = getProgressToNextLevel();
  const sustainabilityImpact = calculateSustainabilityImpact(progress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Rewards Dashboard</h1>
          <p className="text-lg text-gray-600">Track your progress and unlock amazing benefits</p>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: currentLevel.badgeColor }}
              >
                {currentLevel.level}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentLevel.title}</h2>
                <p className="text-gray-600">{progress.currentPoints} points</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{progress.currentPoints}</div>
              <div className="text-sm text-gray-600">Current Points</div>
            </div>
          </div>

          {/* Progress Bar */}
          {nextLevel && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress to {nextLevel.title}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {Math.max(0, nextLevel.minPoints - progress.totalPoints)} more points needed for {nextLevel.title}
              </p>
            </div>
          )}

          {/* Show max level message if at highest level */}
          {!nextLevel && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Maximum Level Reached!</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                You've reached the highest level! Keep earning points for rewards.
              </p>
            </div>
          )}

          {/* Level Benefits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentLevel.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <Award className="h-4 w-4 text-green-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sustainability Impact */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold text-gray-900">Carbon Offset</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {sustainabilityImpact.carbonOffset}kg
            </div>
            <p className="text-sm text-gray-600">CO₂ offset</p>
          </div>

          {/* Trees Planted */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Trees className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Trees Planted</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progress.treesPlanted}
            </div>
            <p className="text-sm text-gray-600">Trees planted</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="h-6 w-6 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Activity Streak</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progress.streakDays} days
            </div>
            <p className="text-sm text-gray-600">Current streak</p>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Orders</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progress.ordersCompleted}
            </div>
            <p className="text-sm text-gray-600">Orders completed</p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Badges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sustainability Badges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Sustainability
              </h3>
              <div className="space-y-3">
                {getBadgesByCategory('sustainability').map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{badge.name}</div>
                      <div className="text-sm text-gray-600">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopping Badges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Shopping
              </h3>
              <div className="space-y-3">
                {getBadgesByCategory('shopping').map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{badge.name}</div>
                      <div className="text-sm text-gray-600">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Achievements
              </h3>
              <div className="space-y-3">
                {getBadgesByCategory('achievement').map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{badge.name}</div>
                      <div className="text-sm text-gray-600">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
          
          {availableRewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Earn more points to unlock rewards!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRewards.map(reward => (
                <div key={reward.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {reward.pointsCost}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  <button
                    onClick={() => handleRedeemReward(reward.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Badges Notification */}
        {newBadges.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6" />
              <div>
                <div className="font-semibold">New Badges Unlocked!</div>
                <div className="text-sm opacity-90">
                  {newBadges.map(badge => badge.name).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationDashboard; 