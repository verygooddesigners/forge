-- =============================================================================
-- Fix: Super Admin access to is_admin() + project_research RLS
-- =============================================================================
-- Two-part fix for "Failed to start research" when super admin runs research
-- on another user's project.
--
-- Part 1: Update is_admin() to include 'Super Administrator'.
--   This cascades to ALL existing RLS policies that call is_admin():
--   projects SELECT/UPDATE/DELETE, smart_briefs, writer_models, etc.
--
-- Part 2: Fix project_research RLS — the existing policy had no is_admin()
--   check, so even after Part 1, Jeremy couldn't read/write Tyler's
--   project_research rows.
-- =============================================================================

-- Part 1: is_admin() — include Super Administrator
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'Super Administrator')
  FROM public.users
  WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Part 2: Fix project_research RLS
-- Drop old policy (checks only projects.user_id = auth.uid())
DROP POLICY IF EXISTS "Users can manage own project research" ON public.project_research;

-- Recreate with admin bypass
CREATE POLICY "Users can manage own project research" ON public.project_research
  FOR ALL USING (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_research.project_id
        AND projects.user_id = auth.uid()
    )
  );
