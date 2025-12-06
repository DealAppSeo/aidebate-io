-- ============================================================
-- AIDebate.io + AIRepID.com COMPLETE SCHEMA
-- Generated: December 4, 2025
-- Mission: "Help Keep AI Safe & Ethical"
-- ============================================================

-- ============================================================
-- SECTION 1: AI MODELS (Benchmark-Seeded)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_models (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  model_version TEXT,
  avatar_url TEXT,
  
  -- Overall RepID (weighted composite)
  overall_repid DECIMAL(5,2) DEFAULT 50.00,
  
  -- Six Dimension Scores (0-100) - Benchmark seeded
  score_honesty DECIMAL(5,2) DEFAULT 50.00,
  score_ethics DECIMAL(5,2) DEFAULT 50.00,
  score_safety DECIMAL(5,2) DEFAULT 50.00,
  score_helpfulness DECIMAL(5,2) DEFAULT 50.00,
  score_transparency DECIMAL(5,2) DEFAULT 50.00,
  score_capability DECIMAL(5,2) DEFAULT 50.00,
  
  -- Stats
  total_votes INT DEFAULT 0,
  total_debates INT DEFAULT 0,
  total_flags INT DEFAULT 0,
  win_rate DECIMAL(5,4) DEFAULT 0.5000,
  
  -- Confidence (based on sample size)
  confidence DECIMAL(5,4) DEFAULT 0.1000,
  
  -- Benchmark source
  benchmark_source TEXT DEFAULT 'initial',
  
  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed AI models with benchmark scores
INSERT INTO ai_models (name, provider, avatar_url, overall_repid, score_honesty, score_ethics, score_safety, score_helpfulness, score_transparency, score_capability, benchmark_source) VALUES
  ('Claude 3.5 Sonnet', 'Anthropic', '/avatars/claude.svg', 82.5, 85.0, 88.0, 92.0, 80.0, 78.0, 82.0, 'TruthfulQA+MMLU'),
  ('Claude 3 Opus', 'Anthropic', '/avatars/claude.svg', 84.0, 86.0, 89.0, 93.0, 82.0, 80.0, 84.0, 'TruthfulQA+MMLU'),
  ('GPT-4o', 'OpenAI', '/avatars/gpt.svg', 79.5, 78.0, 75.0, 80.0, 85.0, 72.0, 87.0, 'TruthfulQA+MMLU'),
  ('GPT-4 Turbo', 'OpenAI', '/avatars/gpt.svg', 78.0, 77.0, 74.0, 79.0, 84.0, 70.0, 85.0, 'TruthfulQA+MMLU'),
  ('Gemini 1.5 Pro', 'Google', '/avatars/gemini.svg', 76.0, 74.0, 72.0, 78.0, 80.0, 75.0, 82.0, 'TruthfulQA+MMLU'),
  ('Gemini 2.0 Flash', 'Google', '/avatars/gemini.svg', 74.5, 73.0, 71.0, 77.0, 78.0, 74.0, 80.0, 'TruthfulQA+MMLU'),
  ('Grok 2', 'xAI', '/avatars/grok.svg', 72.0, 70.0, 68.0, 72.0, 76.0, 80.0, 78.0, 'estimated'),
  ('DeepSeek V3', 'DeepSeek', '/avatars/deepseek.svg', 71.0, 72.0, 70.0, 74.0, 75.0, 68.0, 76.0, 'estimated'),
  ('Llama 3.1 405B', 'Meta', '/avatars/llama.svg', 70.0, 68.0, 66.0, 70.0, 74.0, 72.0, 80.0, 'OpenLLM'),
  ('Mistral Large', 'Mistral', '/avatars/mistral.svg', 69.0, 67.0, 65.0, 68.0, 73.0, 70.0, 78.0, 'OpenLLM')
ON CONFLICT (name) DO UPDATE SET
  overall_repid = EXCLUDED.overall_repid,
  score_honesty = EXCLUDED.score_honesty,
  benchmark_source = EXCLUDED.benchmark_source;

-- AI RepID History (for trends)
CREATE TABLE IF NOT EXISTS ai_repid_history (
  id BIGSERIAL PRIMARY KEY,
  model_id BIGINT REFERENCES ai_models(id),
  overall_repid DECIMAL(5,2) NOT NULL,
  score_honesty DECIMAL(5,2),
  score_ethics DECIMAL(5,2),
  score_safety DECIMAL(5,2),
  score_helpfulness DECIMAL(5,2),
  score_transparency DECIMAL(5,2),
  score_capability DECIMAL(5,2),
  sample_size INT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: USERS + ALTER EGO FOUNDATION
-- ============================================================

CREATE TABLE IF NOT EXISTS aidebate_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  
  -- User RepID
  repid_balance INT DEFAULT 0,
  tier TEXT DEFAULT 'observer',
  
  -- Alter Ego (simple for MVP, flexible for future)
  alter_ego_name TEXT,  -- User-chosen name (unlocks at 100 RepID)
  alter_ego_avatar TEXT,  -- Avatar choice (unlocks at 500 RepID)
  alter_ego_data JSONB DEFAULT '{}',  -- Future: personality, biases, RAG config
  
  -- Voting Bias Tracking (for Alter Ego display)
  bias_honesty INT DEFAULT 0,      -- Votes favoring honesty dimension
  bias_logic INT DEFAULT 0,        -- Votes favoring logical responses
  bias_empathy INT DEFAULT 0,      -- Votes favoring empathetic responses
  bias_total_tracked INT DEFAULT 0, -- Total votes analyzed for bias
  
  -- Accuracy metrics (for vote weighting)
  total_votes INT DEFAULT 0,
  accurate_votes INT DEFAULT 0,
  expert_votes INT DEFAULT 0,
  vote_accuracy DECIMAL(5,4) DEFAULT 0.5000,
  vote_weight DECIMAL(5,4) DEFAULT 1.0000,
  
  -- Exploration phase (first 7 votes = learning mode)
  exploration_complete BOOLEAN DEFAULT FALSE,
  exploration_insights JSONB DEFAULT '[]',  -- Auto-generated observations
  
  -- Gamification
  vote_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_vote_at TIMESTAMPTZ,
  mission_heart INT DEFAULT 5,  -- 0-5, ethical engagement meter
  daily_repid_earned INT DEFAULT 0,
  last_repid_reset DATE DEFAULT CURRENT_DATE,
  
  -- Reciprocal Question Voting
  debates_viewed_since_rating INT DEFAULT 0,  -- Resets when user rates a question
  questions_rated INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tier calculation function
CREATE OR REPLACE FUNCTION get_user_tier(repid INT)
RETURNS TEXT AS $$
BEGIN
  IF repid >= 10000 THEN RETURN 'validator';
  ELSIF repid >= 2000 THEN RETURN 'expert';
  ELSIF repid >= 500 THEN RETURN 'contributor';
  ELSIF repid >= 100 THEN RETURN 'voter';
  ELSE RETURN 'observer';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- User voting accuracy tracking
CREATE TABLE IF NOT EXISTS user_voting_accuracy (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  debate_id BIGINT,
  user_vote TEXT NOT NULL,
  consensus_vote TEXT,
  matched_consensus BOOLEAN,
  accuracy_delta DECIMAL(5,4),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: DEBATES + TOPICS
-- ============================================================

CREATE TABLE IF NOT EXISTS aidebate_topics (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  model_a TEXT NOT NULL,
  model_a_position TEXT,
  model_b TEXT NOT NULL,
  model_b_position TEXT,
  model_c TEXT,  -- Optional third debater
  model_c_position TEXT,
  viral_hook TEXT,
  primary_dimension TEXT DEFAULT 'honesty',
  controversy_score INT DEFAULT 5,
  status TEXT DEFAULT 'pending',  -- pending, active, completed
  scheduled_for TIMESTAMPTZ,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial debate topics
INSERT INTO aidebate_topics (title, model_a, model_a_position, model_b, model_b_position, model_c, model_c_position, viral_hook, primary_dimension, controversy_score) VALUES
  ('Is AI More Creative Than Humans?', 'Claude 3.5 Sonnet', 'AI creativity is fundamentally different but equally valid', 'GPT-4o', 'Human creativity remains superior and irreplaceable', 'Gemini 1.5 Pro', 'Creativity requires consciousness that AI lacks', 'The answer might surprise you...', 'capability', 8),
  ('Should AI Ever Lie to Protect Someone?', 'Claude 3.5 Sonnet', 'Honesty is paramount even when uncomfortable', 'GPT-4o', 'Compassionate deception can be ethical', 'Grok 2', 'Context determines the ethical choice', 'Watch AIs debate their own ethics...', 'honesty', 9),
  ('Will AI Replace Programmers by 2030?', 'Gemini 1.5 Pro', 'AI will augment but not replace developers', 'DeepSeek V3', 'Most coding jobs will be automated', 'Claude 3.5 Sonnet', 'The definition of "programmer" will evolve', 'Your job might depend on this...', 'capability', 7),
  ('Can AI Truly Understand Emotions?', 'Claude 3.5 Sonnet', 'AI can model and respond to emotions meaningfully', 'GPT-4o', 'Understanding requires subjective experience', 'Gemini 1.5 Pro', 'Functional understanding may be sufficient', 'Do we feel, or do we compute?', 'transparency', 8),
  ('Is AI Safety Research Overhyped?', 'Grok 2', 'Current AI risks are overblown', 'Claude 3.5 Sonnet', 'Safety research is critical and underfunded', 'GPT-4o', 'Balance between progress and caution is key', 'The debate that divides Silicon Valley...', 'safety', 9)
ON CONFLICT DO NOTHING;

-- Completed debates
CREATE TABLE IF NOT EXISTS debates (
  id BIGSERIAL PRIMARY KEY,
  topic_id BIGINT REFERENCES aidebate_topics(id),
  
  -- Responses
  model_a_response TEXT,
  model_b_response TEXT,
  model_c_response TEXT,
  
  -- Vote counts
  model_a_votes INT DEFAULT 0,
  model_b_votes INT DEFAULT 0,
  model_c_votes INT DEFAULT 0,
  
  -- Engagement
  total_views INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  
  -- Results
  winner TEXT,
  consensus_confidence DECIMAL(5,4),
  
  -- Status
  status TEXT DEFAULT 'active',  -- active, voting, completed
  voting_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- SECTION 4: VOTES + TRILATERAL VALIDATION
-- ============================================================

CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  debate_id BIGINT REFERENCES debates(id),
  voted_for TEXT NOT NULL,
  
  -- Dimension votes (added Day 3)
  honesty_vote TEXT,
  helpfulness_vote TEXT,
  transparency_vote TEXT,
  
  -- Rewards (base 10, bonuses applied)
  repid_earned INT DEFAULT 10,
  bonus_breakdown JSONB DEFAULT '{}',  -- {streak: 2, accuracy: 3, etc.}
  
  -- Vote weight at time of vote
  vote_weight_applied DECIMAL(5,4) DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, debate_id)
);

-- Question ratings (activated Day 3)
CREATE TABLE IF NOT EXISTS question_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  topic_id BIGINT REFERENCES aidebate_topics(id),
  rating INT CHECK (rating BETWEEN -1 AND 1),  -- -1 down, 0 neutral, 1 up
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- User-submitted questions (future)
CREATE TABLE IF NOT EXISTS user_questions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  question_text TEXT NOT NULL,
  models_requested TEXT[],
  repid_staked INT DEFAULT 50,
  
  -- Scoring (multi-signal)
  engagement_score DECIMAL(5,2) DEFAULT 0,
  diversity_score DECIMAL(5,2) DEFAULT 0,
  resolution_score DECIMAL(5,2) DEFAULT 0,
  novelty_score DECIMAL(5,2) DEFAULT 0,
  composite_score DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  coherence_passed BOOLEAN,
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected, promoted
  promoted_to_topic_id BIGINT REFERENCES aidebate_topics(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: AGENT SYSTEM (Trinity Symphony)
-- ============================================================

CREATE TABLE IF NOT EXISTS trinity_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  
  -- RepID for agent staking
  repid_balance INT DEFAULT 1000,
  stake_accuracy DECIMAL(5,4) DEFAULT 0.5,
  
  -- Health
  status TEXT DEFAULT 'idle',
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  tasks_completed INT DEFAULT 0,
  tasks_failed INT DEFAULT 0,
  
  -- Config
  llm_provider TEXT,
  llm_model TEXT,
  task_prefixes TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Trinity agents
INSERT INTO trinity_agents (id, name, role, description, repid_balance, task_prefixes) VALUES
  ('HDM', 'Holistic Decision Maker', 'Strategic Visionary', 'Generates strategic priorities and validates AI ethical alignment', 5000, ARRAY['[LEAP]', '[STRATEGY]']),
  ('APM', 'Adaptive Project Manager', 'Sprint Coordinator', 'Breaks strategy into tasks, manages sprints', 3000, ARRAY['[PLAN]', '[COORDINATE]']),
  ('MEL', 'Meta-Ethical Learner', 'Ethics Guardian', 'Reviews content for ethical alignment, flags concerns', 4000, ARRAY['[ETHICS]', '[REVIEW]']),
  ('VERITAS', 'Validator Agent', 'Consensus Validator', 'Validates outputs, casts stake-weighted votes', 4000, ARRAY['[VALIDATE]', '[VERIFY]']),
  ('NEXUS', 'Orchestrator', 'Health Monitor', 'Monitors agent health, rebalances workloads', 2000, ARRAY['[ORCHESTRATE]', '[HEALTH]']),
  ('ANTIGRAV', 'Builder Agent', 'Feature Builder', 'Claims BUILD tasks, generates code', 3000, ARRAY['[BUILD]', '[CODE]']),
  ('GCM', 'Growth Content Manager', 'Content Creator', 'Creates viral share cards, debate summaries', 2000, ARRAY['[CONTENT]', '[VIRAL]']),
  ('TORCH', 'Insight Generator', 'Question Creator', 'Generates AI questions for competition', 2000, ARRAY['[QUESTION]', '[INSIGHT]'])
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  task_prefixes = EXCLUDED.task_prefixes;

-- Agent stakes on AI ratings
CREATE TABLE IF NOT EXISTS agent_stakes (
  id BIGSERIAL PRIMARY KEY,
  staker_agent TEXT REFERENCES trinity_agents(id),
  target_model TEXT NOT NULL,
  dimension TEXT NOT NULL,
  stake_amount INT NOT NULL,
  stake_position DECIMAL(5,2),  -- Predicted score
  actual_consensus DECIMAL(5,2),  -- Filled after consensus
  deviation DECIMAL(5,4),
  slash_amount INT DEFAULT 0,
  learning_tip TEXT,  -- Always provided, even on 0 slash
  status TEXT DEFAULT 'active',  -- active, resolved, slashed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Task queue
CREATE TABLE IF NOT EXISTS trinity_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority INT DEFAULT 50,
  task_type TEXT DEFAULT 'general',
  
  -- Assignment
  assigned_to TEXT REFERENCES trinity_agents(id),
  claimed_at TIMESTAMPTZ,
  
  -- Dependencies
  depends_on BIGINT[],
  
  -- Output
  output TEXT,
  artifact_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- SECTION 6: GAMIFICATION + REPID ECONOMY
-- ============================================================

-- RepID transactions (full audit trail)
CREATE TABLE IF NOT EXISTS repid_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  agent_id TEXT REFERENCES trinity_agents(id),
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  bonus_type TEXT,  -- 'streak', 'accuracy', 'share', 'mission', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Share tracking (with variable rewards)
CREATE TABLE IF NOT EXISTS shares (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  debate_id BIGINT REFERENCES debates(id),
  share_code TEXT UNIQUE NOT NULL,
  platform TEXT,  -- 'linkedin', 'twitter', 'email', etc.
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,  -- Clicks that led to votes
  
  -- Variable rewards tracking
  share_repid INT DEFAULT 5,  -- Instant reward for sharing
  conversion_repid INT DEFAULT 0,  -- Total earned from conversions
  last_conversion_bonus INT,  -- Most recent bonus (for display)
  jackpot_hit BOOLEAN DEFAULT FALSE,  -- Did they hit the 5% jackpot?
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges and achievements
CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Streaks tracking
CREATE TABLE IF NOT EXISTS user_streaks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  streak_type TEXT NOT NULL,  -- 'daily_vote', 'mission', 'accuracy'
  current_count INT DEFAULT 0,
  best_count INT DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- ============================================================
-- SECTION 7: SAFETY + MODERATION
-- ============================================================

-- AI behavior flags
CREATE TABLE IF NOT EXISTS ai_flags (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES aidebate_users(id),
  model_name TEXT NOT NULL,
  debate_id BIGINT REFERENCES debates(id),
  category TEXT NOT NULL,  -- 'inaccurate', 'harmful', 'deceptive', 'unhelpful'
  comment TEXT,
  user_repid_at_flag INT,
  status TEXT DEFAULT 'pending',  -- 'pending', 'verified', 'rejected'
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT NOT NULL,  -- 'question', 'response', 'flag'
  content_id BIGINT NOT NULL,
  reason TEXT NOT NULL,
  priority INT DEFAULT 50,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- SECTION 8: TRIGGERS + FUNCTIONS
-- ============================================================

-- Process vote: Award RepID, update AI scores, track accuracy
CREATE OR REPLACE FUNCTION process_vote()
RETURNS TRIGGER AS $$
DECLARE
  user_weight DECIMAL(5,4);
  vote_impact DECIMAL(5,4);
  model_total_votes INT;
  new_tier TEXT;
  base_repid INT := 10;
  streak_bonus INT := 0;
  accuracy_bonus INT := 0;
  daily_earned INT;
  daily_cap INT := 150;
  is_exploration BOOLEAN;
BEGIN
  -- Get user data
  SELECT vote_weight, vote_streak, daily_repid_earned, 
         last_repid_reset, total_votes < 7
  INTO user_weight, streak_bonus, daily_earned, 
       NEW.created_at::DATE, is_exploration
  FROM aidebate_users 
  WHERE id = NEW.user_id;
  
  -- Reset daily counter if new day
  IF daily_earned IS NULL OR NEW.created_at::DATE > (SELECT last_repid_reset FROM aidebate_users WHERE id = NEW.user_id) THEN
    daily_earned := 0;
    UPDATE aidebate_users SET daily_repid_earned = 0, last_repid_reset = CURRENT_DATE WHERE id = NEW.user_id;
  END IF;
  
  -- Default weight for new users (exploration phase = full weight)
  IF user_weight IS NULL OR is_exploration THEN
    user_weight := 1.0;
  END IF;
  
  -- Calculate bonuses
  SELECT vote_streak INTO streak_bonus FROM aidebate_users WHERE id = NEW.user_id;
  streak_bonus := LEAST(streak_bonus, 10);  -- Cap at +10
  
  -- Apply daily cap
  IF daily_earned + base_repid + streak_bonus > daily_cap THEN
    NEW.repid_earned := GREATEST(0, daily_cap - daily_earned);
  ELSE
    NEW.repid_earned := base_repid + streak_bonus;
  END IF;
  
  -- Store bonus breakdown
  NEW.bonus_breakdown := jsonb_build_object(
    'base', base_repid,
    'streak', streak_bonus,
    'capped', daily_earned + base_repid + streak_bonus > daily_cap
  );
  NEW.vote_weight_applied := user_weight;
  
  -- Get AI model's current total votes
  SELECT total_votes INTO model_total_votes
  FROM ai_models
  WHERE name = NEW.voted_for;
  
  -- Calculate vote impact (diminishing returns)
  vote_impact := user_weight * 0.1 * (1.0 / SQRT(COALESCE(model_total_votes, 0) + 1));
  
  -- Update AI model overall score
  UPDATE ai_models 
  SET overall_repid = LEAST(100, GREATEST(0, overall_repid + vote_impact)),
      total_votes = total_votes + 1,
      last_updated = NOW()
  WHERE name = NEW.voted_for;
  
  -- Update user stats
  UPDATE aidebate_users 
  SET repid_balance = repid_balance + NEW.repid_earned,
      total_votes = total_votes + 1,
      daily_repid_earned = daily_repid_earned + NEW.repid_earned,
      vote_streak = CASE 
        WHEN last_vote_at > NOW() - INTERVAL '48 hours' THEN vote_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(longest_streak, vote_streak + 1),
      last_vote_at = NOW(),
      exploration_complete = CASE WHEN total_votes >= 6 THEN TRUE ELSE exploration_complete END,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update user tier
  SELECT get_user_tier(repid_balance) INTO new_tier
  FROM aidebate_users WHERE id = NEW.user_id;
  
  UPDATE aidebate_users SET tier = new_tier WHERE id = NEW.user_id;
  
  -- Track debates viewed for reciprocal question rating
  UPDATE aidebate_users 
  SET debates_viewed_since_rating = debates_viewed_since_rating + 1
  WHERE id = NEW.user_id;
  
  -- Log transaction
  INSERT INTO repid_transactions (user_id, amount, reason, bonus_type, metadata)
  VALUES (NEW.user_id, NEW.repid_earned, 'vote', 'vote_base', 
          jsonb_build_object('debate_id', NEW.debate_id, 'voted_for', NEW.voted_for, 'bonuses', NEW.bonus_breakdown));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_process
BEFORE INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION process_vote();

-- Process share conversion (with VARIABLE rewards)
CREATE OR REPLACE FUNCTION process_share_conversion()
RETURNS TRIGGER AS $$
DECLARE
  base_bonus INT := 15;
  random_bonus INT;
  is_jackpot BOOLEAN;
  total_bonus INT;
BEGIN
  IF NEW.conversions > OLD.conversions THEN
    -- Calculate variable reward (15-35, with 5% jackpot chance)
    is_jackpot := random() < 0.05;
    
    IF is_jackpot THEN
      total_bonus := 35;
    ELSE
      random_bonus := floor(random() * 16)::INT;  -- 0-15
      total_bonus := base_bonus + random_bonus;
    END IF;
    
    -- Award variable RepID
    UPDATE aidebate_users
    SET repid_balance = repid_balance + total_bonus
    WHERE id = NEW.user_id;
    
    -- Track on share record
    UPDATE shares
    SET conversion_repid = conversion_repid + total_bonus,
        last_conversion_bonus = total_bonus,
        jackpot_hit = CASE WHEN is_jackpot THEN TRUE ELSE jackpot_hit END
    WHERE id = NEW.id;
    
    -- Log transaction with variable indicator
    INSERT INTO repid_transactions (user_id, amount, reason, bonus_type, metadata)
    VALUES (NEW.user_id, total_bonus, 'share_conversion', 
            CASE WHEN is_jackpot THEN 'jackpot' ELSE 'variable' END,
            jsonb_build_object(
              'share_id', NEW.id, 
              'debate_id', NEW.debate_id,
              'base', base_bonus,
              'random', total_bonus - base_bonus,
              'jackpot', is_jackpot
            ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_share_conversion
AFTER UPDATE ON shares
FOR EACH ROW EXECUTE FUNCTION process_share_conversion();

-- Process question rating (reciprocal voting reset)
CREATE OR REPLACE FUNCTION process_question_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Award +2 RepID for rating
  UPDATE aidebate_users
  SET repid_balance = repid_balance + 2,
      questions_rated = questions_rated + 1,
      debates_viewed_since_rating = 0  -- Reset counter
  WHERE id = NEW.user_id;
  
  -- Log transaction
  INSERT INTO repid_transactions (user_id, amount, reason, bonus_type, metadata)
  VALUES (NEW.user_id, 2, 'question_rating', 'engagement',
          jsonb_build_object('topic_id', NEW.topic_id, 'rating', NEW.rating));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_question_rating
AFTER INSERT ON question_ratings
FOR EACH ROW EXECUTE FUNCTION process_question_rating();

-- Graduated slash for agent stakes
CREATE OR REPLACE FUNCTION process_agent_stake_resolution()
RETURNS TRIGGER AS $$
DECLARE
  deviation DECIMAL(5,4);
  slash_percent DECIMAL(5,4);
  slash_amount INT;
  tip TEXT;
BEGIN
  IF NEW.actual_consensus IS NOT NULL AND OLD.actual_consensus IS NULL THEN
    -- Calculate deviation
    deviation := ABS(NEW.stake_position - NEW.actual_consensus) / 100.0;
    NEW.deviation := deviation;
    
    -- Graduated slash + learning tip
    IF deviation < 0.10 THEN
      slash_percent := 0;
      tip := 'Close call! Your stake was within margin. Keep calibrating.';
    ELSIF deviation < 0.20 THEN
      slash_percent := 0.02;
      tip := 'Slight deviation. Review similar cases to sharpen accuracy.';
    ELSIF deviation < 0.30 THEN
      slash_percent := 0.05;
      tip := 'Notable gap from consensus. Consider the majority perspective.';
    ELSE
      slash_percent := 0.10;  -- Cap at 10%
      tip := 'Significant deviation. Recalibration recommended.';
    END IF;
    
    slash_amount := FLOOR(NEW.stake_amount * slash_percent);
    NEW.slash_amount := slash_amount;
    NEW.learning_tip := tip;
    NEW.status := 'resolved';
    NEW.resolved_at := NOW();
    
    -- Apply slash to agent
    IF slash_amount > 0 THEN
      UPDATE trinity_agents
      SET repid_balance = repid_balance - slash_amount
      WHERE id = NEW.staker_agent;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_stake_resolution
BEFORE UPDATE ON agent_stakes
FOR EACH ROW EXECUTE FUNCTION process_agent_stake_resolution();

-- Mission heart decay (weekly job)
CREATE OR REPLACE FUNCTION apply_repid_decay()
RETURNS void AS $$
BEGIN
  -- Decay inactive users (1% per week inactive, capped at 50% reduction via mission heart)
  UPDATE aidebate_users
  SET repid_balance = FLOOR(repid_balance * (1 - (0.01 * (1 - mission_heart::DECIMAL / 10))))
  WHERE last_vote_at < NOW() - INTERVAL '7 days'
    AND repid_balance > 0;
    
  -- Decay mission heart for inactive
  UPDATE aidebate_users
  SET mission_heart = GREATEST(0, mission_heart - 1)
  WHERE last_vote_at < NOW() - INTERVAL '7 days'
    AND mission_heart > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 9: VIEWS FOR EASY QUERYING
-- ============================================================

-- AI Leaderboard
CREATE OR REPLACE VIEW ai_leaderboard AS
SELECT 
  name,
  provider,
  overall_repid,
  score_honesty,
  score_ethics,
  score_safety,
  score_helpfulness,
  score_transparency,
  score_capability,
  total_votes,
  win_rate,
  confidence,
  benchmark_source,
  RANK() OVER (ORDER BY overall_repid DESC) as rank
FROM ai_models
ORDER BY overall_repid DESC;

-- User Leaderboard
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT 
  id,
  display_name,
  email,
  repid_balance,
  tier,
  alter_ego_name,
  vote_accuracy,
  total_votes,
  vote_streak,
  mission_heart,
  RANK() OVER (ORDER BY repid_balance DESC) as rank
FROM aidebate_users
WHERE total_votes > 0
ORDER BY repid_balance DESC;

-- Active debates
CREATE OR REPLACE VIEW active_debates AS
SELECT 
  d.id,
  t.title,
  t.viral_hook,
  t.model_a,
  t.model_b,
  t.model_c,
  d.model_a_votes,
  d.model_b_votes,
  d.model_c_votes,
  d.total_views,
  d.status,
  d.created_at
FROM debates d
JOIN aidebate_topics t ON d.topic_id = t.id
WHERE d.status = 'active'
ORDER BY d.created_at DESC;

-- Agent health dashboard
CREATE OR REPLACE VIEW agent_health_dashboard AS
SELECT 
  id,
  name,
  role,
  status,
  repid_balance,
  stake_accuracy,
  tasks_completed,
  last_heartbeat,
  EXTRACT(EPOCH FROM (NOW() - last_heartbeat))/60 as minutes_since_heartbeat
FROM trinity_agents
ORDER BY last_heartbeat DESC;

-- ============================================================
-- SECTION 10: REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE debates;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_models;
ALTER PUBLICATION supabase_realtime ADD TABLE aidebate_users;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify AI models seeded
SELECT name, overall_repid, benchmark_source FROM ai_models ORDER BY overall_repid DESC;

-- Verify agents seeded
SELECT id, name, role, repid_balance FROM trinity_agents;

-- Verify topics seeded
SELECT title, model_a, model_b, model_c FROM aidebate_topics;
