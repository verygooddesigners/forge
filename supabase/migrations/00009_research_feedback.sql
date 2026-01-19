-- Migration: 00009_research_feedback.sql
-- Description: Research feedback and research_brief column

-- Create research feedback table
CREATE TABLE IF NOT EXISTS public.research_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  article_url TEXT NOT NULL,
  article_title TEXT,
  feedback_reason TEXT NOT NULL,
  additional_notes TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_feedback_project ON public.research_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_research_feedback_url ON public.research_feedback(article_url);
CREATE INDEX IF NOT EXISTS idx_research_feedback_user ON public.research_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_research_feedback_reason ON public.research_feedback(feedback_reason);

-- Enable RLS
ALTER TABLE public.research_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own research feedback"
  ON public.research_feedback FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all research feedback"
  ON public.research_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add research_brief column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS research_brief JSONB DEFAULT NULL;

-- Create GIN index for JSONB querying
CREATE INDEX IF NOT EXISTS idx_projects_research_brief ON public.projects USING GIN (research_brief);
