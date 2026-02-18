-- Migration: Content Analytics System
-- Adds analytics event tracking, teams, and saved filters

-- ============================================================================
-- 1. analytics_events: Track all user content actions
-- ============================================================================
CREATE TABLE public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  entity_id UUID,
  entity_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_date ON public.analytics_events(user_id, created_at DESC);

-- ============================================================================
-- 2. teams + team_members: Lightweight team structure
-- ============================================================================
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  managed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- ============================================================================
-- 3. saved_filters: Saved and shareable analytics filter configs
-- ============================================================================
CREATE TABLE public.saved_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_saved_filters_user_id ON public.saved_filters(user_id);
CREATE INDEX idx_saved_filters_share_token ON public.saved_filters(share_token);

-- ============================================================================
-- 4. Row Level Security
-- ============================================================================

-- analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can view all analytics events"
  ON public.analytics_events FOR SELECT
  USING (has_minimum_role(auth.uid(), 'team_leader'));

CREATE POLICY "Authenticated users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team leaders can view teams"
  ON public.teams FOR SELECT
  USING (has_minimum_role(auth.uid(), 'team_leader'));

CREATE POLICY "Managers can manage teams"
  ON public.teams FOR ALL
  USING (has_minimum_role(auth.uid(), 'manager'));

-- team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team leaders can view team members"
  ON public.team_members FOR SELECT
  USING (has_minimum_role(auth.uid(), 'team_leader'));

CREATE POLICY "Managers can manage team members"
  ON public.team_members FOR ALL
  USING (has_minimum_role(auth.uid(), 'manager'));

-- saved_filters
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own filters"
  ON public.saved_filters FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view shared filters"
  ON public.saved_filters FOR SELECT
  USING (is_shared = true);

-- ============================================================================
-- 5. Allow team_leader+ to view all projects for analytics
-- ============================================================================
CREATE POLICY "Team leaders can view all projects for analytics"
  ON public.projects FOR SELECT
  USING (has_minimum_role(auth.uid(), 'team_leader'));

-- ============================================================================
-- 6. Triggers for updated_at
-- ============================================================================
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_filters_updated_at
  BEFORE UPDATE ON public.saved_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
