import { supabase } from '@/integrations/supabase/client';
import { authenticatedOperation } from '@/lib/auth-utils';

export interface UserLevel {
  level: number;
  title: string;
  minPoints: number;
  benefits: string[];
  badgeColor: string;
  discountPercentage: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'sustainability' | 'shopping' | 'social' | 'achievement';
  pointsReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  userId: string;
  level: number;
  currentPoints: number;
  totalPoints: number;
  badges: Badge[];
  streakDays: number;
  lastActivityDate: string;
  sustainabilityScore: number;
  carbonOffset: number; // in kg CO2
  treesPlanted: number;
  ordersCompleted: number;
  totalSpent: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountPercentage?: number;
  freeShipping?: boolean;
  earlyAccess?: boolean;
  exclusiveProduct?: string;
  available: boolean;
}

// User Levels Configuration
export const USER_LEVELS: UserLevel[] = [
  {
    level: 1,
    title: "Eco Explorer",
    minPoints: 0,
    benefits: ["5% discount on eco-friendly products", "Free shipping on orders over ₹500"],
    badgeColor: "#10B981",
    discountPercentage: 5
  },
  {
    level: 2,
    title: "Green Guardian",
    minPoints: 100,
    benefits: ["10% discount on all products", "Free shipping on all orders", "Early access to sales"],
    badgeColor: "#059669",
    discountPercentage: 10
  },
  {
    level: 3,
    title: "Sustainability Champion",
    minPoints: 300,
    benefits: ["15% discount on all products", "Priority customer support", "Exclusive product access"],
    badgeColor: "#047857",
    discountPercentage: 15
  },
  {
    level: 4,
    title: "Earth Warrior",
    minPoints: 600,
    benefits: ["20% discount on all products", "VIP customer status", "Personal shopping assistant"],
    badgeColor: "#065F46",
    discountPercentage: 20
  },
  {
    level: 5,
    title: "Planet Protector",
    minPoints: 1000,
    benefits: ["25% discount on all products", "Lifetime VIP status", "Custom product requests"],
    badgeColor: "#064E3B",
    discountPercentage: 25
  }
];

// Badges Configuration
export const BADGES: Badge[] = [
  // Sustainability Badges
  {
    id: "first-eco-purchase",
    name: "First Eco Purchase",
    description: "Made your first sustainable purchase",
    icon: "🌱",
    category: "sustainability",
    pointsReward: 50,
    unlocked: false
  },
  {
    id: "carbon-neutral",
    name: "Carbon Neutral",
    description: "Offset 100kg of CO2 through purchases",
    icon: "🌍",
    category: "sustainability",
    pointsReward: 100,
    unlocked: false
  },
  {
    id: "tree-planter",
    name: "Tree Planter",
    description: "Helped plant 10 trees through purchases",
    icon: "🌳",
    category: "sustainability",
    pointsReward: 150,
    unlocked: false
  },
  {
    id: "eco-warrior",
    name: "Eco Warrior",
    description: "Completed 50 sustainable purchases",
    icon: "🛡️",
    category: "sustainability",
    pointsReward: 200,
    unlocked: false
  },

  // Shopping Badges
  {
    id: "first-order",
    name: "First Order",
    description: "Completed your first order",
    icon: "🛒",
    category: "shopping",
    pointsReward: 25,
    unlocked: false
  },
  {
    id: "loyal-customer",
    name: "Loyal Customer",
    description: "Completed 10 orders",
    icon: "💎",
    category: "shopping",
    pointsReward: 75,
    unlocked: false
  },
  {
    id: "big-spender",
    name: "Big Spender",
    description: "Spent over ₹10,000 on sustainable products",
    icon: "💰",
    category: "shopping",
    pointsReward: 125,
    unlocked: false
  },
  {
    id: "review-master",
    name: "Review Master",
    description: "Wrote 20 helpful reviews",
    icon: "⭐",
    category: "shopping",
    pointsReward: 100,
    unlocked: false
  },

  // Social Badges
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Shared 5 products on social media",
    icon: "🦋",
    category: "social",
    pointsReward: 50,
    unlocked: false
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Referred 10 friends to the platform",
    icon: "📢",
    category: "social",
    pointsReward: 150,
    unlocked: false
  },

  // Achievement Badges
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Maintained 30-day activity streak",
    icon: "🔥",
    category: "achievement",
    pointsReward: 200,
    unlocked: false
  },
  {
    id: "level-up",
    name: "Level Up",
    description: "Reached level 3",
    icon: "⬆️",
    category: "achievement",
    pointsReward: 100,
    unlocked: false
  }
];

// Rewards Configuration
export const REWARDS: Reward[] = [
  {
    id: "free-shipping",
    name: "Free Shipping",
    description: "Free shipping on your next order",
    pointsCost: 50,
    freeShipping: true,
    available: true
  },
  {
    id: "discount-10",
    name: "10% Discount",
    description: "10% off your next purchase",
    pointsCost: 100,
    discountPercentage: 10,
    available: true
  },
  {
    id: "discount-20",
    name: "20% Discount",
    description: "20% off your next purchase",
    pointsCost: 200,
    discountPercentage: 20,
    available: true
  }
];

// Points calculation functions
export const calculatePoints = {
  purchase: (amount: number, isEcoFriendly: boolean = true) => {
    const basePoints = Math.floor(amount / 100); // 1 point per ₹100
    return isEcoFriendly ? basePoints * 2 : basePoints;
  },
  
  review: () => 10,
  
  socialShare: () => 5,
  
  referral: () => 25,
  
  dailyLogin: () => 2,
  
  carbonOffset: (kgCO2: number) => Math.floor(kgCO2 * 10), // 10 points per kg CO2 offset
  
  treePlanted: () => 15
};

// Get user progress - Now fetches real data from database
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    // Use authenticated operation wrapper for better session handling
    const userProgress = await authenticatedOperation(async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    });

    console.log('Raw user progress from DB:', userProgress);

    // If no progress record exists, create one
    if (!userProgress) {
      console.log('No user progress found, creating new record for user:', userId);
      
      const { data: newProgress, error: createError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          level: 1,
          current_points: 0,
          badges: [],
          streak_days: 0,
          last_activity_date: new Date().toISOString(),
          sustainability_score: 0,
          carbon_offset: 0,
          trees_planted: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user progress:', createError);
        return null;
      }

      console.log('Created new user progress:', newProgress);
      return {
        userId,
        level: 1,
        currentPoints: 0,
        totalPoints: 0,
        badges: BADGES.map(badge => ({ ...badge, unlocked: false })),
        streakDays: 0,
        lastActivityDate: new Date().toISOString(),
        sustainabilityScore: 0,
        carbonOffset: 0,
        treesPlanted: 0,
        ordersCompleted: 0,
        totalSpent: 0
      };
    }

    // Fetch total points from transactions
    const totalPoints = await authenticatedOperation(async () => {
      const { data: transactions, error } = await supabase
        .from('points_transactions')
        .select('points')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching points transactions:', error);
        return userProgress.current_points || 0;
      }

      return transactions?.reduce((sum, t) => sum + (t.points || 0), 0) || userProgress.current_points || 0;
    });

    // Fetch order statistics
    const orderStats = await authenticatedOperation(async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('price, quantity')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching orders:', error);
        return { ordersCompleted: 0, totalSpent: 0 };
      }

      const ordersCompleted = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + ((order.price || 0) * (order.quantity || 1)), 0) || 0;

      return { ordersCompleted, totalSpent };
    });

    const unlockedBadges = userProgress.badges || [];
    console.log('Unlocked badges from DB:', unlockedBadges);

    const result = {
      userId,
      level: userProgress.level || 1,
      currentPoints: userProgress.current_points || 0,
      totalPoints,
      badges: BADGES.map(badge => ({ 
        ...badge, 
        unlocked: unlockedBadges.includes(badge.id)
      })),
      streakDays: userProgress.streak_days || 0,
      lastActivityDate: userProgress.last_activity_date || new Date().toISOString(),
      sustainabilityScore: userProgress.sustainability_score || 0,
      carbonOffset: userProgress.carbon_offset || 0,
      treesPlanted: userProgress.trees_planted || 0,
      ordersCompleted: orderStats.ordersCompleted,
      totalSpent: orderStats.totalSpent
    };

    console.log('Final user progress result:', result);
    console.log('Badges with unlock status:', result.badges.map(b => `${b.name}: ${b.unlocked}`));

    return result;

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
}

// Add points to user - Now updates DB and level
export async function addPoints(userId: string, points: number, reason: string): Promise<boolean> {
  try {
    console.log(`Adding ${points} points to user ${userId} for: ${reason}`);

    // 1. Insert a new points transaction
    const { error: txError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points,
        reason,
        created_at: new Date().toISOString(),
      });
    if (txError) {
      console.error('Error inserting points transaction:', txError);
      return false;
    }

    // 2. Recalculate total points
    const { data: transactions, error: fetchError } = await supabase
      .from('points_transactions')
      .select('points')
      .eq('user_id', userId);
    if (fetchError) {
      console.error('Error fetching points transactions:', fetchError);
      return false;
    }
    const totalPoints = transactions?.reduce((sum, t) => sum + (t.points || 0), 0) || 0;

    // 3. Determine new level
    let newLevel = 1;
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= USER_LEVELS[i].minPoints) {
        newLevel = USER_LEVELS[i].level;
        break;
      }
    }

    // 4. Update user_progress with new current_points and level
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        current_points: totalPoints,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (updateError) {
      console.error('Error updating user progress:', updateError);
      return false;
    }

    console.log(`Successfully added points. New total: ${totalPoints}, new level: ${newLevel}`);
    return true;
  } catch (error) {
    console.error('Error in addPoints:', error);
    return false;
  }
}

// Check and award badges - Now functional with real achievement checking
export async function checkAndAwardBadges(userId: string, progress: UserProgress): Promise<Badge[]> {
  try {
    console.log('=== BADGE CHECKING START ===');
    console.log('Checking badges for user:', userId);
    console.log('Current progress:', progress);
    
    // Get user's current orders and achievements
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (ordersError) {
      console.error('Error fetching orders for badge checking:', ordersError);
      return [];
    }

    console.log('User orders found:', orders?.length || 0);
    console.log('Sample order:', orders?.[0]);

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + ((order.price || 0) * (order.quantity || 1)), 0) || 0;
    
    // Calculate CO2 saved for sustainability badges
    const co2Saved = orders?.reduce((sum, order) => {
      const baseCO2 = 3.5;
      const ecoScore = order.eco_score || 0;
      const ecoBonus = (baseCO2 * ecoScore) / 100;
      return sum + baseCO2 + ecoBonus;
    }, 0) || 0;

    const treesPlanted = Math.floor(co2Saved / 22);

    console.log(`=== USER STATS ===`);
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Total Spent: ₹${totalSpent}`);
    console.log(`CO2 Saved: ${co2Saved.toFixed(1)}kg`);
    console.log(`Trees Planted: ${treesPlanted}`);

    // Define badge unlocking conditions
    const badgeConditions = [
      {
        id: 'first-order',
        condition: totalOrders >= 1,
        description: 'First order completed'
      },
      {
        id: 'first-eco-purchase',
        condition: totalOrders >= 1, // All orders in this marketplace are eco-friendly
        description: 'First eco-friendly purchase'
      },
      {
        id: 'loyal-customer',
        condition: totalOrders >= 10,
        description: '10 orders completed'
      },
      {
        id: 'big-spender',
        condition: totalSpent >= 10000,
        description: 'Spent over ₹10,000'
      },
      {
        id: 'carbon-neutral',
        condition: co2Saved >= 100,
        description: 'Offset 100kg CO2'
      },
      {
        id: 'tree-planter',
        condition: treesPlanted >= 10,
        description: 'Helped plant 10 trees'
      },
      {
        id: 'eco-warrior',
        condition: totalOrders >= 50,
        description: '50 sustainable purchases'
      }
    ];

    console.log(`=== BADGE CONDITIONS CHECK ===`);
    badgeConditions.forEach(condition => {
      console.log(`${condition.id}: ${condition.condition} (${condition.description})`);
    });

    // Check which badges should be unlocked
    const newlyUnlockedBadges: Badge[] = [];
    const currentUnlockedBadges = progress.badges.filter(b => b.unlocked).map(b => b.id);
    
    console.log(`Current unlocked badges:`, currentUnlockedBadges);

    for (const badgeCondition of badgeConditions) {
      const badge = BADGES.find(b => b.id === badgeCondition.id);
      if (badge && badgeCondition.condition && !currentUnlockedBadges.includes(badge.id)) {
        console.log(`🎉 UNLOCKING BADGE: ${badge.name} - ${badgeCondition.description}`);
        newlyUnlockedBadges.push({
          ...badge,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        });
      } else if (badge) {
        console.log(`Badge ${badge.name}: condition=${badgeCondition.condition}, already_unlocked=${currentUnlockedBadges.includes(badge.id)}`);
      }
    }

    console.log(`Newly unlocked badges:`, newlyUnlockedBadges.map(b => b.name));

    // If new badges were unlocked, update the database
    if (newlyUnlockedBadges.length > 0) {
      const allUnlockedBadgeIds = [
        ...currentUnlockedBadges,
        ...newlyUnlockedBadges.map(b => b.id)
      ];

      console.log(`Updating database with unlocked badges:`, allUnlockedBadgeIds);

      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          badges: allUnlockedBadgeIds,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating unlocked badges:', updateError);
      } else {
        console.log(`✅ Successfully unlocked ${newlyUnlockedBadges.length} new badges in database`);
      }
    } else {
      console.log('No new badges to unlock');
    }

    console.log('=== BADGE CHECKING END ===');
    return newlyUnlockedBadges;

  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error);
    return [];
  }
}

// Get available rewards - Now checks for already redeemed rewards
export async function getAvailableRewards(userId: string, userPoints: number): Promise<Reward[]> {
  try {
    // Get user's redeemed rewards
    const { data: redeemedRewards, error } = await supabase
      .from('reward_redemptions')
      .select('reward_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching redeemed rewards:', error);
      return [];
    }

    const redeemedRewardIds = redeemedRewards?.map(r => r.reward_id) || [];

    // Filter rewards based on availability, points, and redemption status
    return REWARDS.filter(reward => 
      reward.available && 
      reward.pointsCost <= userPoints &&
      !redeemedRewardIds.includes(reward.id) // Don't show already redeemed rewards
    );
  } catch (error) {
    console.error('Error in getAvailableRewards:', error);
    return [];
  }
}

// Redeem reward - Now functional with database operations
export async function redeemReward(userId: string, rewardId: string): Promise<boolean> {
  try {
    // Get the reward details
    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward || !reward.available) {
      console.error('Reward not found or not available:', rewardId);
      return false;
    }

    // Get current user progress
    const userProgress = await getUserProgress(userId);
    if (!userProgress) {
      console.error('User progress not found for:', userId);
      return false;
    }

    // Check if user has enough points
    if (userProgress.currentPoints < reward.pointsCost) {
      console.error('Insufficient points for reward:', rewardId);
      return false;
    }

    // Start a transaction to ensure data consistency
    const { data: existingRedemption, error: checkError } = await supabase
      .from('reward_redemptions')
      .select('id')
      .eq('user_id', userId)
      .eq('reward_id', rewardId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing redemption:', checkError);
      return false;
    }

    // Check if reward is already redeemed (for one-time rewards)
    if (existingRedemption) {
      console.error('Reward already redeemed:', rewardId);
      return false;
    }

    // Insert redemption record
    const { error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: userId,
        reward_id: rewardId,
        points_spent: reward.pointsCost
      });

    if (redemptionError) {
      console.error('Error inserting redemption:', redemptionError);
      return false;
    }

    // Deduct points from user progress
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        current_points: userProgress.currentPoints - reward.pointsCost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      return false;
    }

    // Add a transaction record for points deduction
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: -reward.pointsCost,
        reason: `Redeemed reward: ${reward.name}`
      });

    if (transactionError) {
      console.error('Error recording points transaction:', transactionError);
      // Don't fail the redemption if transaction recording fails
    }

    console.log(`Successfully redeemed reward: ${reward.name} for user: ${userId}`);
    return true;

  } catch (error) {
    console.error('Error in redeemReward:', error);
    return false;
  }
}

// Get user level benefits
export function getUserLevelBenefits(level: number): UserLevel | null {
  return USER_LEVELS.find(l => l.level === level) || null;
}

// Calculate sustainability impact
export function calculateSustainabilityImpact(progress: UserProgress) {
  return {
    carbonOffset: progress.carbonOffset,
    treesPlanted: progress.treesPlanted,
    sustainabilityScore: progress.sustainabilityScore,
    impactDescription: `You've helped offset ${progress.carbonOffset}kg of CO2 and plant ${progress.treesPlanted} trees!`
  };
} 