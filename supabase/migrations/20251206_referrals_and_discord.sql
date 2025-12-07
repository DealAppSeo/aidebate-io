-- Add referral columns to user_sessions
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS referral_repid_earned INT DEFAULT 0;

-- Referral events table
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_session TEXT NOT NULL,
  referred_session TEXT NOT NULL,
  debate_id UUID REFERENCES debates(id),
  referred_voted BOOLEAN DEFAULT FALSE,
  repid_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup of referral status
CREATE INDEX IF NOT EXISTS idx_referral_events_referred ON referral_events(referred_session);
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events(referrer_session);
