-- User Profiles with stats and customization
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  total_ratings INTEGER DEFAULT 0,
  ratings_today INTEGER DEFAULT 0,
  last_rating_date DATE,
  streak_days INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  avatar_base TEXT DEFAULT 'pikachu',
  equipped_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop Items (cosmetics, customizations)
CREATE TABLE IF NOT EXISTS shop_items (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL, -- 'hat', 'outfit', 'accessory', 'background', 'badge', 'effect'
  item_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  unlock_level INTEGER DEFAULT 1,
  unlock_requirement TEXT, -- e.g., 'rate_100', 'streak_7', 'legendary_10'
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Inventory (purchased/unlocked items)
CREATE TABLE IF NOT EXISTS user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Coin Transactions (audit trail)
CREATE TABLE IF NOT EXISTS coin_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn_rating', 'earn_streak', 'purchase', 'refund', 'admin'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL, -- 'first_rating', 'rate_100', 'streak_7', etc.
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_type ON shop_items(item_type);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile (auto-create on first login)
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own inventory
CREATE POLICY "Users can view own inventory" ON user_inventory
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Everyone can view shop items
CREATE POLICY "Everyone can view shop items" ON shop_items
  FOR SELECT USING (true);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to reset daily rating count at midnight UTC
CREATE OR REPLACE FUNCTION reset_daily_ratings()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET ratings_today = 0
  WHERE last_rating_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Seed some starter shop items
INSERT INTO shop_items (item_type, item_name, display_name, description, price, rarity) VALUES
  ('hat', 'pikachu_cap', 'Pikachu Cap', 'Classic red cap with Pikachu logo', 100, 'common'),
  ('hat', 'team_rocket_hat', 'Team Rocket Hat', 'Prepare for trouble!', 500, 'rare'),
  ('outfit', 'trainer_red', 'Red''s Outfit', 'Iconic outfit from Kanto champion', 1000, 'epic'),
  ('outfit', 'team_magma', 'Team Magma Uniform', 'Expand the land!', 800, 'rare'),
  ('accessory', 'master_ball', 'Master Ball Badge', 'The ultimate catching achievement', 2000, 'legendary'),
  ('accessory', 'shiny_charm', 'Shiny Charm', 'Sparkles with shiny luck', 1500, 'epic'),
  ('background', 'kanto_route', 'Kanto Route', 'Nostalgic grasslands', 300, 'common'),
  ('background', 'champion_room', 'Champion Room', 'Elite Four champion backdrop', 1200, 'epic'),
  ('effect', 'sparkle', 'Sparkle Effect', 'Shimmer and shine', 400, 'rare'),
  ('effect', 'flames', 'Flame Aura', 'Blazing hot', 600, 'rare')
ON CONFLICT (item_name) DO NOTHING;
