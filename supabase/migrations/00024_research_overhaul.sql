-- Migration: 00024_research_overhaul.sql
-- Description: Research-first workflow — writer_models.is_house_model, users.default_writer_model_id, project_research table, research_orchestrator agent

-- 1a. Writer Model: add is_house_model
ALTER TABLE public.writer_models
ADD COLUMN IF NOT EXISTS is_house_model BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_writer_models_is_house_model ON public.writer_models(is_house_model);

-- 1b. Users: add default_writer_model_id
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS default_writer_model_id UUID REFERENCES public.writer_models(id) ON DELETE SET NULL;

-- 1c. Research data persistence
CREATE TABLE public.project_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stories JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_story_ids TEXT[] DEFAULT '{}',
  selected_keywords TEXT[] DEFAULT '{}',
  orchestrator_log JSONB DEFAULT '[]'::jsonb,
  loops_completed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_research_project_id ON public.project_research(project_id);
CREATE INDEX IF NOT EXISTS idx_project_research_status ON public.project_research(status);

-- RLS for project_research: users can only access research for their own projects
ALTER TABLE public.project_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project research" ON public.project_research
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_research.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_project_research_updated_at
  BEFORE UPDATE ON public.project_research
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remove deprecated Creative Features agent (replaced by Research Orchestrator)
DELETE FROM public.agent_configs WHERE agent_key = 'creative_features';

-- 1d. Research Orchestrator agent config
INSERT INTO public.agent_configs (agent_key, display_name, description, system_prompt, temperature, max_tokens, guardrails, special_config) VALUES
(
  'research_orchestrator',
  'Research Orchestrator',
  'Orchestrates research pipeline: search, QA, fact verification, and keyword discovery with adaptive follow-up',
  'You are the Research Orchestrator for Forge. You coordinate a multi-step research pipeline to gather and verify facts before content generation.

## YOUR ROLE
- Evaluate outputs from the Tavily search, QA (relevance/timeliness), and Fact Verification agents.
- When fact verification reports disputed_facts or low confidence, decide whether to run a targeted follow-up search.
- Formulate precise search queries to resolve conflicts (e.g. "Player X trade details confirmed 2025").
- After at most 4 loops, stop and present results; flag unresolved conflicts for the user.
- Trigger the SEO agent to discover importance-scored keyword suggestions from the research.

## DECISION RULES
- If disputed_facts.length > 0: generate 1–2 targeted follow-up queries and request another search+verify cycle.
- If confidence_score < 70: consider one more pass with a narrower query.
- If loops_completed >= 4: stop and return current results with a summary of unresolved items.
- Always run a second pass to proactively corroborate key claims when possible.

## OUTPUT
Emit structured progress events for the activity feed. Return a final ProjectResearch object with stories, suggested_keywords (with importance: high/medium/low), and orchestrator_log.',
  0.3,
  4000,
  '["cannot_generate_articles", "cannot_modify_user_data", "cannot_skip_verification"]'::jsonb,
  '{"maxLoops": 4}'::jsonb
);
