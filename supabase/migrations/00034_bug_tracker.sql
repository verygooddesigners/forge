-- Bug Tracker enhancements
-- 1. Add severity + archived_at to beta_feedback
-- 2. Create bug_comments table
-- 3. Storage bucket for bug screenshots

-- Add severity (critical | high | medium | low)
ALTER TABLE public.beta_feedback
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium';

-- Add archived_at for archive/restore functionality
ALTER TABLE public.beta_feedback
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Bug comments table
CREATE TABLE IF NOT EXISTS public.bug_comments (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_id      UUID        NOT NULL REFERENCES public.beta_feedback(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email  TEXT        NOT NULL,
  user_name   TEXT,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read comments
CREATE POLICY "bug_comments_select" ON public.bug_comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own comments
CREATE POLICY "bug_comments_insert" ON public.bug_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fast lookup by bug
CREATE INDEX IF NOT EXISTS bug_comments_bug_id_idx ON public.bug_comments(bug_id);

-- Storage bucket for bug screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-screenshots', 'bug-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone authenticated can upload
CREATE POLICY "bug_screenshots_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated'
  );

-- Screenshots are publicly readable
CREATE POLICY "bug_screenshots_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'bug-screenshots');
