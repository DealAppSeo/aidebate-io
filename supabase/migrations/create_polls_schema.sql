
-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["Yes", "No"]
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- Using TEXT to match user_sessions if needed, or UUID if preferred. Keeping TEXT for flexibility.
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Allow public read of polls
CREATE POLICY "Enable read access for all users" ON public.polls
    FOR SELECT USING (true);

-- Allow public insert of votes (anon users can vote)
CREATE POLICY "Enable insert for all users" ON public.poll_votes
    FOR INSERT WITH CHECK (true);

-- Allow public read of votes (to calculate results)
CREATE POLICY "Enable read access for all users" ON public.poll_votes
    FOR SELECT USING (true);
