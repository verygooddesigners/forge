-- News Forge Tool: local betting sites, sports discovery, pitches, source lists

-- Admin-managed local betting sites
CREATE TABLE IF NOT EXISTS public.news_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL,
  cities TEXT[] DEFAULT '{}',
  default_sports TEXT[] DEFAULT '{}',
  default_teams JSONB DEFAULT '[]',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- News Forge project metadata (linked 1:1 to a base project)
CREATE TABLE IF NOT EXISTS public.news_forge_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  site_id UUID REFERENCES public.news_sites(id),
  selected_cities TEXT[] DEFAULT '{}',
  selected_sports TEXT[] DEFAULT '{}',
  selected_teams JSONB DEFAULT '[]',
  sports_discovery JSONB,
  research_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Story pitches generated for a project
CREATE TABLE IF NOT EXISTS public.news_forge_pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  synopsis TEXT,
  source_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  position INTEGER DEFAULT 0,
  master_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sources backing each pitch
CREATE TABLE IF NOT EXISTS public.news_forge_pitch_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id UUID REFERENCES public.news_forge_pitches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_domain TEXT,
  trust_score NUMERIC(3,2) DEFAULT 0.5,
  status TEXT DEFAULT 'neutral',
  published_date TEXT,
  full_content TEXT,
  source_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User-created saved source lists
CREATE TABLE IF NOT EXISTS public.news_source_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_source_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES public.news_source_lists(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  source_domain TEXT,
  trust_score NUMERIC(3,2),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, url)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_forge_projects_project_id ON public.news_forge_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_news_forge_pitches_project_id ON public.news_forge_pitches(project_id);
CREATE INDEX IF NOT EXISTS idx_news_forge_pitch_sources_pitch_id ON public.news_forge_pitch_sources(pitch_id);
CREATE INDEX IF NOT EXISTS idx_news_source_lists_user_id ON public.news_source_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_news_source_list_items_list_id ON public.news_source_list_items(list_id);

-- RLS
ALTER TABLE public.news_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_forge_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_forge_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_forge_pitch_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_source_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_source_list_items ENABLE ROW LEVEL SECURITY;

-- news_sites: readable by all authenticated users, writable by admins
CREATE POLICY "Anyone can read news_sites" ON public.news_sites
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage news_sites" ON public.news_sites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'Super Administrator')
    )
  );

-- news_forge_projects: owned by the project's user
CREATE POLICY "Users can manage own news_forge_projects" ON public.news_forge_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = news_forge_projects.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- news_forge_pitches: owned via project
CREATE POLICY "Users can manage own news_forge_pitches" ON public.news_forge_pitches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = news_forge_pitches.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- news_forge_pitch_sources: owned via pitch -> project
CREATE POLICY "Users can manage own pitch_sources" ON public.news_forge_pitch_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.news_forge_pitches
      JOIN public.projects ON projects.id = news_forge_pitches.project_id
      WHERE news_forge_pitches.id = news_forge_pitch_sources.pitch_id
      AND projects.user_id = auth.uid()
    )
  );

-- news_source_lists: owned by user
CREATE POLICY "Users can manage own source_lists" ON public.news_source_lists
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own source_list_items" ON public.news_source_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.news_source_lists
      WHERE news_source_lists.id = news_source_list_items.list_id
      AND news_source_lists.user_id = auth.uid()
    )
  );

-- Pre-approve News Forge tool in the marketplace
INSERT INTO public.tools (
  name, slug, version, description_short, description_long,
  github_repo_url, status, permissions_requested,
  sidebar_label, sidebar_icon, sidebar_order
)
VALUES (
  'News Forge',
  'news-forge',
  '1.0.0',
  'Sports news research & writing engine for local betting sites',
  'News Forge turns the Forge content engine into a dedicated sports news research and writing system. Select your local betting site (BetCarolina, BetTexas, etc.), let the AI discover what''s in season, then research, pitch, and write accurate news stories with full source transparency.',
  'https://github.com/verygooddesigners/forge',
  'approved',
  '["projects.write", "research.run", "ai.generate"]'::jsonb,
  'News Forge',
  'Newspaper',
  10
)
ON CONFLICT (slug) DO NOTHING;

-- Seed initial local sites
INSERT INTO public.news_sites (name, slug, state, state_code, cities, default_sports, default_teams) VALUES
(
  'BetCarolina',
  'bet-carolina',
  'North Carolina',
  'NC',
  ARRAY['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
  ARRAY['NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'NHL', 'MLB'],
  '[{"name":"Carolina Panthers","sport":"Football","league":"NFL"},{"name":"Carolina Hurricanes","sport":"Hockey","league":"NHL"},{"name":"Charlotte Hornets","sport":"Basketball","league":"NBA"},{"name":"North Carolina Tar Heels","sport":"Basketball","league":"NCAA"},{"name":"Duke Blue Devils","sport":"Basketball","league":"NCAA"},{"name":"NC State Wolfpack","sport":"Football","league":"NCAA"}]'::jsonb
),
(
  'BetTexas',
  'bet-texas',
  'Texas',
  'TX',
  ARRAY['Dallas', 'Houston', 'Austin', 'San Antonio', 'Fort Worth'],
  ARRAY['NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'MLB', 'NHL'],
  '[{"name":"Dallas Cowboys","sport":"Football","league":"NFL"},{"name":"Houston Texans","sport":"Football","league":"NFL"},{"name":"Dallas Mavericks","sport":"Basketball","league":"NBA"},{"name":"Houston Rockets","sport":"Basketball","league":"NBA"},{"name":"San Antonio Spurs","sport":"Basketball","league":"NBA"},{"name":"Texas Longhorns","sport":"Football","league":"NCAA"},{"name":"TCU Horned Frogs","sport":"Football","league":"NCAA"},{"name":"Texas Tech Red Raiders","sport":"Football","league":"NCAA"},{"name":"Houston Astros","sport":"Baseball","league":"MLB"},{"name":"Texas Rangers","sport":"Baseball","league":"MLB"},{"name":"Dallas Stars","sport":"Hockey","league":"NHL"}]'::jsonb
),
(
  'BetFlorida',
  'bet-florida',
  'Florida',
  'FL',
  ARRAY['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale'],
  ARRAY['NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'MLB', 'NHL'],
  '[{"name":"Miami Dolphins","sport":"Football","league":"NFL"},{"name":"Tampa Bay Buccaneers","sport":"Football","league":"NFL"},{"name":"Jacksonville Jaguars","sport":"Football","league":"NFL"},{"name":"Miami Heat","sport":"Basketball","league":"NBA"},{"name":"Orlando Magic","sport":"Basketball","league":"NBA"},{"name":"Florida Gators","sport":"Football","league":"NCAA"},{"name":"Florida State Seminoles","sport":"Football","league":"NCAA"},{"name":"Miami Hurricanes","sport":"Football","league":"NCAA"},{"name":"Miami Marlins","sport":"Baseball","league":"MLB"},{"name":"Tampa Bay Rays","sport":"Baseball","league":"MLB"},{"name":"Tampa Bay Lightning","sport":"Hockey","league":"NHL"},{"name":"Florida Panthers","sport":"Hockey","league":"NHL"}]'::jsonb
),
(
  'BetOhio',
  'bet-ohio',
  'Ohio',
  'OH',
  ARRAY['Columbus', 'Cleveland', 'Cincinnati', 'Akron', 'Dayton'],
  ARRAY['NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'MLB'],
  '[{"name":"Cleveland Browns","sport":"Football","league":"NFL"},{"name":"Cincinnati Bengals","sport":"Football","league":"NFL"},{"name":"Cleveland Cavaliers","sport":"Basketball","league":"NBA"},{"name":"Ohio State Buckeyes","sport":"Football","league":"NCAA"},{"name":"Cincinnati Bearcats","sport":"Football","league":"NCAA"},{"name":"Cleveland Guardians","sport":"Baseball","league":"MLB"},{"name":"Cincinnati Reds","sport":"Baseball","league":"MLB"}]'::jsonb
),
(
  'BetColorado',
  'bet-colorado',
  'Colorado',
  'CO',
  ARRAY['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder'],
  ARRAY['NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'MLB', 'NHL', 'MLS'],
  '[{"name":"Denver Broncos","sport":"Football","league":"NFL"},{"name":"Denver Nuggets","sport":"Basketball","league":"NBA"},{"name":"Colorado Avalanche","sport":"Hockey","league":"NHL"},{"name":"Colorado Rockies","sport":"Baseball","league":"MLB"},{"name":"Colorado Rapids","sport":"Soccer","league":"MLS"},{"name":"Colorado Buffaloes","sport":"Football","league":"NCAA"}]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
