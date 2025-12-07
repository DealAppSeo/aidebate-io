CREATE TABLE audio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  debate_id UUID REFERENCES debates(id),
  event TEXT NOT NULL,
  round_index INT,
  audio_position DECIMAL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audio_analytics_debate ON audio_analytics(debate_id, event);
