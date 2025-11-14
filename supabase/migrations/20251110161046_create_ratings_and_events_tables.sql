/*
  # Create ratings and events tables for Pokémon ratings app

  1. New Tables
    - `user_ratings` - Stores individual user ratings for each Pokémon
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `pokemon_dex` (integer, Pokédex number)
      - `rating` (integer, 0-10)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Unique constraint on (user_id, pokemon_dex)
    
    - `rating_events` - Stores historical rating events for analytics
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `pokemon_dex` (integer, Pokédex number)
      - `rating` (integer, 0-10)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write their own data
    - Public read access to aggregate stats (future feature)

  3. Indexes
    - Index on (user_id, pokemon_dex) for fast lookups
    - Index on (user_id, created_at) for timeline queries
    - Index on pokemon_dex for community stats queries
*/

CREATE TABLE IF NOT EXISTS user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pokemon_dex integer NOT NULL CHECK (pokemon_dex > 0 AND pokemon_dex <= 10000),
  rating integer NOT NULL CHECK (rating >= 0 AND rating <= 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pokemon_dex)
);

CREATE TABLE IF NOT EXISTS rating_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pokemon_dex integer NOT NULL CHECK (pokemon_dex > 0 AND pokemon_dex <= 10000),
  rating integer NOT NULL CHECK (rating >= 0 AND rating <= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
  ON user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON user_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON user_ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own rating events"
  ON rating_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rating events"
  ON rating_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_ratings_lookup ON user_ratings(user_id, pokemon_dex);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_events_user_time ON rating_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rating_events_pokemon ON rating_events(pokemon_dex);