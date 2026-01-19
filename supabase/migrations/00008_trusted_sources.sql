-- Migration: 00008_trusted_sources.sql
-- Description: Trusted sources for fact verification

CREATE TABLE IF NOT EXISTS public.trusted_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  trust_level TEXT NOT NULL CHECK (trust_level IN ('high', 'medium', 'low', 'untrusted')),
  category TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trusted_sources_domain ON public.trusted_sources(domain);
CREATE INDEX IF NOT EXISTS idx_trusted_sources_trust_level ON public.trusted_sources(trust_level);
CREATE INDEX IF NOT EXISTS idx_trusted_sources_category ON public.trusted_sources USING GIN(category);

-- Enable RLS
ALTER TABLE public.trusted_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can read, only super admin can modify
CREATE POLICY "Anyone can view trusted sources"
  ON public.trusted_sources FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage trusted sources"
  ON public.trusted_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email = 'jeremy.botter@gdcgroup.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email = 'jeremy.botter@gdcgroup.com'
    )
  );

-- Pre-populate with trusted sports sources
INSERT INTO public.trusted_sources (domain, name, trust_level, category) VALUES
  ('espn.com', 'ESPN', 'high', ARRAY['sports', 'nfl', 'nba', 'mlb', 'nhl']),
  ('nfl.com', 'NFL.com', 'high', ARRAY['nfl', 'football']),
  ('nba.com', 'NBA.com', 'high', ARRAY['nba', 'basketball']),
  ('mlb.com', 'MLB.com', 'high', ARRAY['mlb', 'baseball']),
  ('nhl.com', 'NHL.com', 'high', ARRAY['nhl', 'hockey']),
  ('rotowire.com', 'RotoWire', 'high', ARRAY['sports', 'fantasy', 'nfl', 'nba', 'mlb']),
  ('si.com', 'Sports Illustrated', 'high', ARRAY['sports', 'nfl', 'nba']),
  ('theathletic.com', 'The Athletic', 'high', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('sportingnews.com', 'Sporting News', 'medium', ARRAY['sports', 'nfl', 'nba']),
  ('bleacherreport.com', 'Bleacher Report', 'medium', ARRAY['sports', 'nfl', 'nba']),
  ('cbssports.com', 'CBS Sports', 'medium', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('foxsports.com', 'FOX Sports', 'medium', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('nbcsports.com', 'NBC Sports', 'medium', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('profootballtalk.com', 'Pro Football Talk', 'medium', ARRAY['nfl', 'football']),
  ('reddit.com', 'Reddit', 'low', ARRAY['sports', 'general']),
  ('twitter.com', 'Twitter/X', 'low', ARRAY['sports', 'general']),
  ('x.com', 'X (Twitter)', 'low', ARRAY['sports', 'general'])
ON CONFLICT (domain) DO NOTHING;
