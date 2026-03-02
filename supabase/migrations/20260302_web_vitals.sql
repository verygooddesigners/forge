CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,       -- 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value FLOAT NOT NULL,            -- metric value in ms (or unitless for CLS)
  rating TEXT,                     -- 'good' | 'needs-improvement' | 'poor'
  pathname TEXT,                   -- the page path, e.g. '/dashboard'
  navigation_type TEXT,            -- 'navigate' | 'reload' | 'back_forward' | 'prerender'
  user_agent TEXT,
  connection_type TEXT,            -- 'slow-2g' | '2g' | '3g' | '4g' | 'wifi'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient time-range queries in the dashboard
CREATE INDEX idx_web_vitals_created_at ON web_vitals (created_at DESC);
CREATE INDEX idx_web_vitals_metric_name ON web_vitals (metric_name, created_at DESC);

-- Enable RLS but allow inserts from anon (the reporter runs client-side)
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon inserts" ON web_vitals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON web_vitals FOR ALL TO service_role USING (true);
