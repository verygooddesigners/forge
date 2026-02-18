-- Migration: 00013_role_system_overhaul.sql
-- Description: Overhaul user role system with 5-tier hierarchy and simplified account status
-- Roles: super_admin > admin > manager > team_leader > content_creator
-- Account Status: awaiting_confirmation | confirmed

-- ============================================================================
-- STEP 1: Create the new role enum (can't alter enum to remove values, so we
-- need to create a new one and migrate)
-- ============================================================================

-- Create the new role enum
CREATE TYPE user_role_v2 AS ENUM (
  'super_admin',
  'admin',
  'manager',
  'team_leader',
  'content_creator'
);

-- Add new column with the new enum type
ALTER TABLE public.users ADD COLUMN role_new user_role_v2;

-- Migrate existing data
UPDATE public.users SET role_new = CASE
  WHEN role::text = 'admin' THEN 'admin'::user_role_v2
  WHEN role::text = 'strategist' THEN 'content_creator'::user_role_v2
  WHEN role::text = 'editor' THEN 'content_creator'::user_role_v2
  ELSE 'content_creator'::user_role_v2
END;

-- Set NOT NULL and default
ALTER TABLE public.users ALTER COLUMN role_new SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN role_new SET DEFAULT 'content_creator'::user_role_v2;

-- Drop old column and rename new one
ALTER TABLE public.users DROP COLUMN role;
ALTER TABLE public.users RENAME COLUMN role_new TO role;

-- Drop the old enum type
DROP TYPE user_role;

-- Rename new enum to the original name
ALTER TYPE user_role_v2 RENAME TO user_role;

-- ============================================================================
-- STEP 2: Simplify account_status to just 2 values
-- ============================================================================

-- Drop existing check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_account_status_check;

-- Migrate existing account_status values
UPDATE public.users SET account_status = CASE
  WHEN account_status = 'pending' THEN 'awaiting_confirmation'
  ELSE 'confirmed'
END;

-- Add new check constraint with only 2 values
ALTER TABLE public.users ADD CONSTRAINT users_account_status_check
  CHECK (account_status IN ('awaiting_confirmation', 'confirmed'));

-- Set default for new users
ALTER TABLE public.users ALTER COLUMN account_status SET DEFAULT 'awaiting_confirmation';

-- ============================================================================
-- STEP 3: Create role hierarchy helper function
-- ============================================================================

-- Helper: Returns numeric level for a role (higher = more privileged)
CREATE OR REPLACE FUNCTION role_level(r user_role)
RETURNS INTEGER AS $$
  SELECT CASE r
    WHEN 'super_admin' THEN 5
    WHEN 'admin' THEN 4
    WHEN 'manager' THEN 3
    WHEN 'team_leader' THEN 2
    WHEN 'content_creator' THEN 1
    ELSE 0
  END;
$$ LANGUAGE SQL IMMUTABLE;

-- Helper: Check if a user has at least the specified minimum role
CREATE OR REPLACE FUNCTION has_minimum_role(user_id UUID, min_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND role_level(role) >= role_level(min_role)
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Update the is_admin helper to use the new role hierarchy (admin or above)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT has_minimum_role(user_id, 'admin');
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper: Check if user account is confirmed
CREATE OR REPLACE FUNCTION is_confirmed(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND account_status = 'confirmed'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Update handle_new_user trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    'content_creator',
    'awaiting_confirmation'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Update RLS policies for agent_configs (remove hardcoded email)
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Super admins can manage agent configs" ON public.agent_configs;

-- New policy: manager+ can manage agent configs
CREATE POLICY "Managers and above can manage agent configs" ON public.agent_configs
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'manager')
  );

-- ============================================================================
-- STEP 6: Update RLS policies for trusted_sources (remove hardcoded email)
-- ============================================================================

-- Drop old write policy
DROP POLICY IF EXISTS "Super admin can manage trusted sources" ON public.trusted_sources;

-- New policy: admin+ can manage trusted sources
CREATE POLICY "Admins can manage trusted sources" ON public.trusted_sources
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- STEP 7: Update RLS policies for ai_settings (team_leader+ can manage)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage AI settings" ON public.ai_settings;

CREATE POLICY "Team leaders and above can manage AI settings" ON public.ai_settings
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'team_leader')
  );

-- ============================================================================
-- STEP 8: Update RLS policies for ai_helper_entries
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all entries" ON public.ai_helper_entries;

CREATE POLICY "Admins can manage all entries" ON public.ai_helper_entries
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- STEP 9: Update RLS policies for cursor remote (super_admin only)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage cursor commands" ON public.cursor_remote_commands;
DROP POLICY IF EXISTS "Admins can manage cursor agent status" ON public.cursor_agent_status;

CREATE POLICY "Super admins can manage cursor commands" ON public.cursor_remote_commands
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    has_minimum_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admins can manage cursor agent status" ON public.cursor_agent_status
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    has_minimum_role(auth.uid(), 'super_admin')
  );

-- ============================================================================
-- STEP 10: Update RLS policies for users table
-- ============================================================================

-- Drop existing user management policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;

-- Team leaders+ can view all users
CREATE POLICY "Team leaders and above can view all users" ON public.users
  FOR SELECT USING (
    has_minimum_role(auth.uid(), 'team_leader')
  );

-- Admins+ can update users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- Admins+ can insert users
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    has_minimum_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- STEP 11: Update RLS policies for API keys (admin+)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage API keys" ON public.api_keys;

CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- STEP 12: Update RLS policies for tools system
-- ============================================================================

-- Drop old admin policies for tools
DROP POLICY IF EXISTS "Admins can view all tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can update any tool" ON public.tools;
DROP POLICY IF EXISTS "Admins can delete tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can manage tool permissions" ON public.tool_permissions;

-- Admin+ can view all tools
CREATE POLICY "Admins can view all tools" ON public.tools
  FOR SELECT USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- Admin+ can update any tool
CREATE POLICY "Admins can update any tool" ON public.tools
  FOR UPDATE USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- Admin+ can delete tools
CREATE POLICY "Admins can delete tools" ON public.tools
  FOR DELETE USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- Admin+ can manage tool permissions
CREATE POLICY "Admins can manage tool permissions" ON public.tool_permissions
  FOR ALL USING (
    has_minimum_role(auth.uid(), 'admin')
  );

-- ============================================================================
-- STEP 13: Update briefs policies for team_leader edit access
-- ============================================================================

DROP POLICY IF EXISTS "Users can update their own briefs" ON public.briefs;
DROP POLICY IF EXISTS "Users can delete their own briefs" ON public.briefs;

-- Team leaders+ can update any brief, content creators only their own
CREATE POLICY "Users can update briefs" ON public.briefs
  FOR UPDATE USING (
    created_by = auth.uid()
    OR has_minimum_role(auth.uid(), 'team_leader')
  );

-- Managers+ can delete any brief, content creators only their own
CREATE POLICY "Users can delete briefs" ON public.briefs
  FOR DELETE USING (
    created_by = auth.uid()
    OR has_minimum_role(auth.uid(), 'manager')
  );

-- ============================================================================
-- STEP 14: Update view policy for briefs to include team_leader
-- ============================================================================

DROP POLICY IF EXISTS "Users can view shared briefs" ON public.briefs;

CREATE POLICY "Users can view shared briefs" ON public.briefs
  FOR SELECT USING (
    is_shared = true
    OR created_by = auth.uid()
    OR has_minimum_role(auth.uid(), 'team_leader')
  );

-- Update comment
COMMENT ON COLUMN public.users.role IS 'User role hierarchy: super_admin > admin > manager > team_leader > content_creator';
COMMENT ON COLUMN public.users.account_status IS 'Account status: awaiting_confirmation (email not verified) or confirmed (active)';
