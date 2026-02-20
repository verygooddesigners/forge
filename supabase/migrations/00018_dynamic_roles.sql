-- Migration: 00018_dynamic_roles.sql
-- Description: Convert from enum-based roles to dynamic roles table
-- Roles table replaces the user_role enum with human-readable display names

-- ============================================================================
-- STEP 1: Create the roles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed the 5 initial roles
INSERT INTO roles (name, description) VALUES
  ('Super Administrator', 'Unrestricted access to all platform features and configuration.'),
  ('Administrator', 'Full user management. Can configure SSO and toggle agents.'),
  ('Manager', 'Can manage users and teams. Elevated AI and analytics access.'),
  ('Team Leader', 'Can access admin tools and manage AI agents. No user management.'),
  ('Content Creator', 'Default role for new users. Can create and edit their own content.')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 2: Add is_tool_creator to users table
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_tool_creator BOOLEAN DEFAULT false NOT NULL;

-- ============================================================================
-- STEP 3: Convert users.role from ENUM to TEXT with new display names
-- ============================================================================

-- Add a temporary text column
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_text TEXT;

-- Map old enum values to new display names
UPDATE users SET role_text = CASE role::text
  WHEN 'super_admin'     THEN 'Super Administrator'
  WHEN 'admin'           THEN 'Administrator'
  WHEN 'manager'         THEN 'Manager'
  WHEN 'team_leader'     THEN 'Team Leader'
  WHEN 'content_creator' THEN 'Content Creator'
  ELSE 'Content Creator'
END;

-- Drop the old enum column (drops NOT NULL constraint too)
ALTER TABLE users DROP COLUMN role;

-- Rename the text column to role
ALTER TABLE users RENAME COLUMN role_text TO role;

-- Add NOT NULL and default constraints
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'Content Creator';

-- ============================================================================
-- STEP 4: Delete all users except jeremy.botter@gdcgroup.com
-- Set that user to Super Administrator
-- ============================================================================

DELETE FROM users WHERE email != 'jeremy.botter@gdcgroup.com';

UPDATE users SET role = 'Super Administrator' WHERE email = 'jeremy.botter@gdcgroup.com';

-- ============================================================================
-- STEP 5: Drop the user_role ENUM type
-- ============================================================================

DROP TYPE IF EXISTS user_role;

-- ============================================================================
-- STEP 6: Drop old helper functions
-- ============================================================================

DROP FUNCTION IF EXISTS role_level(user_role);
DROP FUNCTION IF EXISTS has_minimum_role(UUID, user_role);

-- ============================================================================
-- STEP 7: Create new has_permission() SQL function
-- Checks user_permission_overrides first, then falls back to role_permissions
-- ============================================================================

CREATE OR REPLACE FUNCTION has_permission(p_user_id UUID, p_permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_override_enabled BOOLEAN;
  v_override_exists  BOOLEAN := FALSE;
  v_user_role        TEXT;
  v_role_enabled     BOOLEAN;
BEGIN
  -- 1. Check user_permission_overrides first (individual overrides take precedence)
  SELECT enabled INTO v_override_enabled
  FROM user_permission_overrides
  WHERE user_id = p_user_id AND permission_key = p_permission_key
  LIMIT 1;

  IF FOUND THEN
    RETURN v_override_enabled;
  END IF;

  -- 2. Get user's current role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 3. Check role_permissions for that role
  SELECT enabled INTO v_role_enabled
  FROM role_permissions
  WHERE role = v_user_role AND permission_key = p_permission_key
  LIMIT 1;

  IF FOUND THEN
    RETURN v_role_enabled;
  END IF;

  RETURN FALSE;
END;
$$;

-- ============================================================================
-- STEP 8: Create is_super_admin() helper
-- ============================================================================

CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_user_id AND role = 'Super Administrator'
  );
$$;

-- ============================================================================
-- STEP 9: Update handle_new_user() trigger function
-- Default role is now "Content Creator" (display name)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    'Content Creator',
    'awaiting_confirmation'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 10: Update role_permissions to use new display names
-- Convert old internal names to new human-readable names
-- ============================================================================

UPDATE role_permissions SET role = 'Super Administrator' WHERE role = 'super_admin';
UPDATE role_permissions SET role = 'Administrator'       WHERE role = 'admin';
UPDATE role_permissions SET role = 'Manager'             WHERE role = 'manager';
UPDATE role_permissions SET role = 'Team Leader'         WHERE role = 'team_leader';
UPDATE role_permissions SET role = 'Content Creator'     WHERE role = 'content_creator';

-- Add the new can_create_teams permission for all roles
-- (was previously part of can_manage_teams, now split out)
INSERT INTO role_permissions (role, permission_key, enabled)
VALUES
  ('Content Creator',    'can_create_teams', false),
  ('Team Leader',        'can_create_teams', false),
  ('Manager',            'can_create_teams', true),
  ('Administrator',      'can_create_teams', true),
  ('Super Administrator','can_create_teams', true)
ON CONFLICT (role, permission_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Ensure all 28 permissions exist for all 5 roles (using INSERT ON CONFLICT DO NOTHING for any missing rows)
-- This covers the case where role_permissions might be missing any rows
DO $$
DECLARE
  r TEXT;
  p TEXT;
  default_enabled BOOLEAN;
BEGIN
  FOR r IN SELECT name FROM roles LOOP
    FOR p IN SELECT unnest(ARRAY[
      'can_create_projects', 'can_edit_own_projects', 'can_delete_own_projects',
      'can_share_projects', 'can_use_smartbriefs', 'can_edit_any_brief',
      'can_delete_any_brief', 'can_export_content', 'can_manage_own_writer_model',
      'can_use_ai_agents', 'can_tune_ai_agents', 'can_toggle_ai_agents',
      'can_edit_master_ai', 'can_manage_trusted_sources',
      'can_view_analytics', 'can_view_team_analytics',
      'can_view_users', 'can_create_users', 'can_edit_users', 'can_delete_users',
      'can_manage_teams', 'can_create_teams',
      'can_access_admin', 'can_view_user_guide', 'can_manage_api_keys',
      'can_manage_sso', 'can_manage_tools', 'can_manage_role_permissions'
    ]) LOOP
      INSERT INTO role_permissions (role, permission_key, enabled)
      VALUES (r, p, false)
      ON CONFLICT (role, permission_key) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- ============================================================================
-- STEP 11: Enable RLS on roles table
-- ============================================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read roles
CREATE POLICY "roles_read" ON roles
  FOR SELECT TO authenticated USING (true);

-- Only users with can_manage_role_permissions can write roles
CREATE POLICY "roles_write" ON roles
  FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'can_manage_role_permissions'))
  WITH CHECK (has_permission(auth.uid(), 'can_manage_role_permissions'));

-- Updated_at trigger for roles
CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 12: Rewrite all RLS policies to use has_permission()
-- ============================================================================

-- ---- users table ----
DROP POLICY IF EXISTS "Team leaders and above can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

CREATE POLICY "users_select" ON users
  FOR SELECT USING (
    auth.uid() = id
    OR has_permission(auth.uid(), 'can_view_users')
  );

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (
    has_permission(auth.uid(), 'can_edit_users')
  );

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (
    has_permission(auth.uid(), 'can_create_users')
  );

-- ---- agent_configs ----
DROP POLICY IF EXISTS "Managers and above can manage agent configs" ON agent_configs;

CREATE POLICY "agent_configs_manage" ON agent_configs
  FOR ALL USING (
    has_permission(auth.uid(), 'can_tune_ai_agents')
  );

-- ---- trusted_sources ----
DROP POLICY IF EXISTS "Admins can manage trusted sources" ON trusted_sources;

CREATE POLICY "trusted_sources_write" ON trusted_sources
  FOR ALL USING (
    has_permission(auth.uid(), 'can_manage_trusted_sources')
  );

-- ---- ai_settings ----
DROP POLICY IF EXISTS "Team leaders and above can manage AI settings" ON ai_settings;

CREATE POLICY "ai_settings_manage" ON ai_settings
  FOR ALL USING (
    has_permission(auth.uid(), 'can_edit_master_ai')
  );

-- ---- ai_helper_entries ----
DROP POLICY IF EXISTS "Admins can manage all entries" ON ai_helper_entries;

CREATE POLICY "ai_helper_entries_manage" ON ai_helper_entries
  FOR ALL USING (
    has_permission(auth.uid(), 'can_edit_master_ai')
  );

-- ---- api_keys ----
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_keys;

CREATE POLICY "api_keys_manage" ON api_keys
  FOR ALL USING (
    has_permission(auth.uid(), 'can_manage_api_keys')
  );

-- ---- tools ----
DROP POLICY IF EXISTS "Admins can view all tools" ON tools;
DROP POLICY IF EXISTS "Admins can update any tool" ON tools;
DROP POLICY IF EXISTS "Admins can delete tools" ON tools;

CREATE POLICY "tools_select" ON tools
  FOR SELECT USING (
    has_permission(auth.uid(), 'can_manage_tools')
  );

CREATE POLICY "tools_update" ON tools
  FOR UPDATE USING (
    has_permission(auth.uid(), 'can_manage_tools')
  );

CREATE POLICY "tools_delete" ON tools
  FOR DELETE USING (
    has_permission(auth.uid(), 'can_manage_tools')
  );

-- ---- tool_permissions ----
DROP POLICY IF EXISTS "Admins can manage tool permissions" ON tool_permissions;

CREATE POLICY "tool_permissions_manage" ON tool_permissions
  FOR ALL USING (
    has_permission(auth.uid(), 'can_manage_tools')
  );

-- ---- briefs ----
DROP POLICY IF EXISTS "Users can update briefs" ON briefs;
DROP POLICY IF EXISTS "Users can delete briefs" ON briefs;
DROP POLICY IF EXISTS "Users can view shared briefs" ON briefs;

CREATE POLICY "briefs_update" ON briefs
  FOR UPDATE USING (
    created_by = auth.uid()
    OR has_permission(auth.uid(), 'can_edit_any_brief')
  );

CREATE POLICY "briefs_delete" ON briefs
  FOR DELETE USING (
    created_by = auth.uid()
    OR has_permission(auth.uid(), 'can_delete_any_brief')
  );

CREATE POLICY "briefs_select" ON briefs
  FOR SELECT USING (
    is_shared = true
    OR created_by = auth.uid()
    OR has_permission(auth.uid(), 'can_edit_any_brief')
  );

-- ---- role_permissions ----
DROP POLICY IF EXISTS "role_permissions_write" ON role_permissions;

CREATE POLICY "role_permissions_write" ON role_permissions
  FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'can_manage_role_permissions'))
  WITH CHECK (has_permission(auth.uid(), 'can_manage_role_permissions'));

-- ---- user_permission_overrides ----
DROP POLICY IF EXISTS "user_permission_overrides_read" ON user_permission_overrides;
DROP POLICY IF EXISTS "user_permission_overrides_write" ON user_permission_overrides;

CREATE POLICY "user_permission_overrides_read" ON user_permission_overrides
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR has_permission(auth.uid(), 'can_edit_users')
  );

CREATE POLICY "user_permission_overrides_write" ON user_permission_overrides
  FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'can_manage_role_permissions'))
  WITH CHECK (has_permission(auth.uid(), 'can_manage_role_permissions'));

-- ---- cursor_remote_commands ----
DROP POLICY IF EXISTS "Super admins can manage cursor commands" ON cursor_remote_commands;

CREATE POLICY "cursor_remote_commands_manage" ON cursor_remote_commands
  FOR ALL USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- ---- cursor_agent_status ----
DROP POLICY IF EXISTS "Super admins can manage cursor agent status" ON cursor_agent_status;

CREATE POLICY "cursor_agent_status_manage" ON cursor_agent_status
  FOR ALL USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN users.role IS 'User role display name (e.g. "Super Administrator", "Content Creator"). References roles.name.';
COMMENT ON TABLE roles IS 'Dynamic roles table. Replaces the user_role enum.';
COMMENT ON FUNCTION has_permission IS 'Check if a user has a specific permission. Checks user_permission_overrides first, then role_permissions.';
COMMENT ON FUNCTION is_super_admin IS 'Check if a user has the Super Administrator role.';
