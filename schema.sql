-- ============================================
-- AIDebate.io Database Schema
-- Run this FIRST in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEBATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS debates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    category TEXT NOT NULL,
    ai1_name TEXT NOT NULL,
    ai1_model TEXT NOT NULL,
    ai2_name TEXT NOT NULL,
    ai2_model TEXT NOT NULL,
    rounds JSONB NOT NULL,
    facilitator_intro TEXT,
    facilitator_outro TEXT,
    total_duration_seconds INTEGER,
    vote_count_ai1 INTEGER DEFAULT 0,
    vote_count_ai2 INTEGER DEFAULT 0,
    vote_count_tie INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    repid_score INTEGER DEFAULT 0,
    debates_watched INTEGER DEFAULT 0,
    debates_voted INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    unlocks JSONB DEFAULT '{"custom_questions": false, "insights": false, "early_access": false}'::jsonb,
    debates_seen TEXT[] DEFAULT '{}',
    influence_score NUMERIC(5,2) DEFAULT 0,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL REFERENCES user_sessions(session_id),
    debate_id UUID NOT NULL REFERENCES debates(id),
    prediction TEXT,
    vote TEXT NOT NULL,
    wagered BOOLEAN DEFAULT false,
    wager_multiplier NUMERIC(3,2) DEFAULT 1.0,
    streak_at_vote INTEGER DEFAULT 0,
    repid_earned INTEGER DEFAULT 0,
    repid_breakdown JSONB,
    prediction_correct BOOLEAN,
    matched_community BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOTE_FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vote_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id UUID NOT NULL REFERENCES votes(id),
    session_id TEXT NOT NULL,
    debate_id UUID NOT NULL,
    winner_voted TEXT NOT NULL,
    reasons TEXT[] DEFAULT '{}',
    other_text TEXT,
    repid_bonus INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HALLUCINATION_FLAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hallucination_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debate_id UUID NOT NULL REFERENCES debates(id),
    session_id TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    ai_flagged TEXT NOT NULL,
    claim_text TEXT NOT NULL,
    user_report TEXT,
    verification_status TEXT DEFAULT 'pending',
    verified_by TEXT,
    flag_count INTEGER DEFAULT 1,
    bounty_paid INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- ============================================
-- DEBATE_GENERATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS debate_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debate_id UUID REFERENCES debates(id),
    ai_name TEXT NOT NULL,
    model_used TEXT NOT NULL,
    prompt_sent TEXT NOT NULL,
    response_received TEXT NOT NULL,
    api_request_id TEXT,
    generation_params JSONB,
    latency_ms INTEGER,
    token_count_input INTEGER,
    token_count_output INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUESTION_SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS question_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    suggested_ai1 TEXT,
    suggested_ai2 TEXT,
    category TEXT,
    moderation_status TEXT DEFAULT 'pending',
    moderation_notes TEXT,
    debate_id UUID REFERENCES debates(id),
    repid_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    moderated_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_debate ON votes(debate_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_debates_status ON debates(status);
CREATE INDEX IF NOT EXISTS idx_debates_featured ON debates(featured);
CREATE INDEX IF NOT EXISTS idx_hallucination_flags_debate ON hallucination_flags(debate_id);
CREATE INDEX IF NOT EXISTS idx_hallucination_flags_status ON hallucination_flags(verification_status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Debates are viewable by everyone" ON debates FOR SELECT USING (true);
CREATE POLICY "Anyone can create a session" ON user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own session" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "Users can update their own session" ON user_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes are viewable" ON votes FOR SELECT USING (true);
