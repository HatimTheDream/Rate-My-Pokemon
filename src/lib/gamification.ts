import { supabase } from './supabase';

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  coins: number;
  total_ratings: number;
  ratings_today: number;
  last_rating_date: string | null;
  streak_days: number;
  level: number;
  xp: number;
  avatar_base: string;
  equipped_items: string[];
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: number;
  item_type: string;
  item_name: string;
  display_name: string;
  description: string | null;
  price: number;
  unlock_level: number;
  unlock_requirement: string | null;
  rarity: string;
  image_url: string | null;
}

export interface CoinTransaction {
  id: number;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const COINS_PER_RATING = 10;
const DAILY_RATING_LIMIT = 50;
const XP_PER_RATING = 5;
const XP_PER_LEVEL = 100;

// Get or create user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Profile doesn't exist yet, create it
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          coins: 0,
          total_ratings: 0,
          ratings_today: 0,
          level: 1,
          xp: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create profile:', createError);
        return null;
      }
      return newProfile;
    }
    console.error('Failed to fetch profile:', error);
    return null;
  }

  return data;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
  return true;
}

// Award coins for rating (with daily limit check)
export async function awardCoinsForRating(userId: string): Promise<{
  success: boolean;
  coinsAwarded: number;
  newBalance: number;
  hitDailyLimit: boolean;
  message: string;
}> {
  const profile = await getUserProfile(userId);
  if (!profile) {
    return {
      success: false,
      coinsAwarded: 0,
      newBalance: 0,
      hitDailyLimit: false,
      message: 'Profile not found',
    };
  }

  // Check if we need to reset daily count
  const today = new Date().toISOString().split('T')[0];
  const lastRatingDate = profile.last_rating_date || '';
  const needsReset = lastRatingDate < today;

  let ratingsToday = needsReset ? 0 : profile.ratings_today;

  // Check daily limit
  if (ratingsToday >= DAILY_RATING_LIMIT) {
    return {
      success: false,
      coinsAwarded: 0,
      newBalance: profile.coins,
      hitDailyLimit: true,
      message: `Daily rating limit reached (${DAILY_RATING_LIMIT}). Come back tomorrow!`,
    };
  }

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let newStreak = profile.streak_days;
  if (needsReset) {
    if (lastRatingDate === yesterdayStr) {
      newStreak += 1; // Continue streak
    } else if (lastRatingDate < yesterdayStr) {
      newStreak = 1; // New streak
    }
  }

  // Calculate rewards
  const baseCoins = COINS_PER_RATING;
  const streakBonus = Math.min(newStreak, 7) * 2; // Up to +14 coins at 7-day streak
  const totalCoins = baseCoins + streakBonus;

  const newXP = profile.xp + XP_PER_RATING;
  const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
  const leveledUp = newLevel > profile.level;

  // Update profile
  const success = await updateUserProfile(userId, {
    coins: profile.coins + totalCoins,
    total_ratings: profile.total_ratings + 1,
    ratings_today: ratingsToday + 1,
    last_rating_date: today,
    streak_days: newStreak,
    xp: newXP,
    level: newLevel,
  });

  if (!success) {
    return {
      success: false,
      coinsAwarded: 0,
      newBalance: profile.coins,
      hitDailyLimit: false,
      message: 'Failed to update profile',
    };
  }

  // Log transaction
  await addCoinTransaction(userId, totalCoins, 'earn_rating', 
    `Rating reward${streakBonus > 0 ? ` (+${streakBonus} streak bonus)` : ''}`);

  let message = `+${totalCoins} coins!`;
  if (leveledUp) {
    message += ` Level up! Now level ${newLevel}!`;
  }
  if (newStreak > 1) {
    message += ` ${newStreak}-day streak! 🔥`;
  }

  return {
    success: true,
    coinsAwarded: totalCoins,
    newBalance: profile.coins + totalCoins,
    hitDailyLimit: false,
    message,
  };
}

// Add coin transaction log
export async function addCoinTransaction(
  userId: string,
  amount: number,
  type: string,
  description: string
): Promise<void> {
  await supabase.from('coin_transactions').insert({
    user_id: userId,
    amount,
    transaction_type: type,
    description,
  });
}

// Get all shop items
export async function getShopItems(): Promise<ShopItem[]> {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .order('price');

  if (error) {
    console.error('Failed to fetch shop items:', error);
    return [];
  }
  return data || [];
}

// Get user inventory
export async function getUserInventory(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('item_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch inventory:', error);
    return [];
  }
  return data?.map((item) => item.item_id) || [];
}

// Purchase shop item
export async function purchaseShopItem(
  userId: string,
  itemId: number
): Promise<{ success: boolean; message: string }> {
  const profile = await getUserProfile(userId);
  if (!profile) {
    return { success: false, message: 'Profile not found' };
  }

  // Get item details
  const { data: item, error: itemError } = await supabase
    .from('shop_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (itemError || !item) {
    return { success: false, message: 'Item not found' };
  }

  // Check if already owned
  const inventory = await getUserInventory(userId);
  if (inventory.includes(itemId)) {
    return { success: false, message: 'You already own this item' };
  }

  // Check level requirement
  if (profile.level < item.unlock_level) {
    return {
      success: false,
      message: `Requires level ${item.unlock_level} (you are level ${profile.level})`,
    };
  }

  // Check coins
  if (profile.coins < item.price) {
    return {
      success: false,
      message: `Not enough coins (need ${item.price}, have ${profile.coins})`,
    };
  }

  // Deduct coins
  const updateSuccess = await updateUserProfile(userId, {
    coins: profile.coins - item.price,
  });

  if (!updateSuccess) {
    return { success: false, message: 'Failed to deduct coins' };
  }

  // Add to inventory
  const { error: invError } = await supabase
    .from('user_inventory')
    .insert({ user_id: userId, item_id: itemId });

  if (invError) {
    console.error('Failed to add to inventory:', invError);
    // Try to refund
    await updateUserProfile(userId, { coins: profile.coins });
    return { success: false, message: 'Failed to add to inventory' };
  }

  // Log transaction
  await addCoinTransaction(
    userId,
    -item.price,
    'purchase',
    `Purchased ${item.display_name}`
  );

  return {
    success: true,
    message: `Successfully purchased ${item.display_name}!`,
  };
}

// Equip item
export async function equipItem(userId: string, itemName: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  const equipped = Array.isArray(profile.equipped_items) ? profile.equipped_items : [];
  if (equipped.includes(itemName)) {
    // Unequip
    const newEquipped = equipped.filter((i) => i !== itemName);
    return await updateUserProfile(userId, { equipped_items: newEquipped });
  } else {
    // Equip
    const newEquipped = [...equipped, itemName];
    return await updateUserProfile(userId, { equipped_items: newEquipped });
  }
}

// Get coin transactions
export async function getCoinTransactions(userId: string): Promise<CoinTransaction[]> {
  const { data, error } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
  return data || [];
}
