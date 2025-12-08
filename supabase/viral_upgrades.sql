-- Run this in Supabase SQL Editor

-- 1. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,
  preferences JSONB DEFAULT '{"weekly_digest": true, "vote_alerts": true}',
  unsubscribed_at TIMESTAMPTZ
);

-- 2. Hot Takes Table
CREATE TABLE IF NOT EXISTS hot_takes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  debate_id TEXT, -- Changed to TEXT if using static/generated IDs, or UUID if foreign key
  user_id UUID,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER CHECK (duration_seconds <= 8),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  moderation_status TEXT DEFAULT 'pending'
);

-- 3. User Profile Enhancements
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_daily_vote DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0;

-- 4. Leaderboard View (Simple)
CREATE OR REPLACE VIEW leaderboard_daily AS
SELECT 
  id as user_id,
  username,
  rep_score as total_rep
FROM user_profiles
ORDER BY rep_score DESC
LIMIT 100;
