-- Track which Aria variant each user experiences
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS aria_tone_preference TEXT DEFAULT NULL;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS demographic_segment TEXT DEFAULT NULL;

-- Track engagement per debate view
CREATE TABLE IF NOT EXISTS debate_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  debate_id UUID REFERENCES debates(id),
  
  -- Variant tracking
  intro_variant TEXT,           -- 'A_energetic', 'B_warm', 'C_prestige'
  prevote_variant TEXT,         -- 'A_direct', 'B_stakes', 'C_playful'
  postvote_variant TEXT,
  
  -- Drop-off tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  intro_completed BOOLEAN DEFAULT FALSE,
  rounds_completed INT DEFAULT 0,        -- 0-6, which round they reached
  dropped_off_at_round INT DEFAULT NULL, -- NULL if completed
  prevote_heard BOOLEAN DEFAULT FALSE,
  vote_cast BOOLEAN DEFAULT FALSE,
  postvote_heard BOOLEAN DEFAULT FALSE,
  
  -- Engagement signals
  time_on_debate_seconds INT,
  replayed_any_round BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,
  went_to_next_debate BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_engagement_variants ON debate_engagement(intro_variant, vote_cast);
CREATE INDEX IF NOT EXISTS idx_engagement_dropoff ON debate_engagement(dropped_off_at_round);
