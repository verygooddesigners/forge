-- Role permissions system
-- Stores configurable permissions per role (dynamic, DB-driven access control)

-- ============================================================================
-- role_permissions table
-- One row per (role, permission_key) pair
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role, permission_key)
);

-- ============================================================================
-- user_permission_overrides table
-- Per-user permission overrides that take precedence over role permissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, permission_key)
);

-- ============================================================================
-- Add description to briefs table (for SmartBrief file browser)
-- ============================================================================
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================================
-- Add is_shared to projects table (for Shared Projects section)
-- ============================================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false NOT NULL;

-- ============================================================================
-- RLS policies
-- ============================================================================

-- role_permissions: readable by all authenticated, writable by super_admin
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_read" ON role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_write" ON role_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- user_permission_overrides: readable by admin+, writable by super_admin
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_permission_overrides_read" ON user_permission_overrides
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "user_permission_overrides_write" ON user_permission_overrides
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================================
-- Seed default permissions for each role
-- These reflect the current hardcoded permission system
-- ============================================================================

-- Helper to insert/update permissions
CREATE OR REPLACE FUNCTION seed_role_permission(p_role TEXT, p_key TEXT, p_enabled BOOLEAN)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO role_permissions (role, permission_key, enabled)
  VALUES (p_role, p_key, p_enabled)
  ON CONFLICT (role, permission_key) DO NOTHING;
END;
$$;

-- Content Creator permissions
SELECT seed_role_permission('content_creator', 'can_create_projects', true);
SELECT seed_role_permission('content_creator', 'can_edit_own_projects', true);
SELECT seed_role_permission('content_creator', 'can_delete_own_projects', true);
SELECT seed_role_permission('content_creator', 'can_use_smartbriefs', true);
SELECT seed_role_permission('content_creator', 'can_use_ai_agents', true);
SELECT seed_role_permission('content_creator', 'can_export_content', true);
SELECT seed_role_permission('content_creator', 'can_view_user_guide', true);
SELECT seed_role_permission('content_creator', 'can_manage_own_writer_model', true);
SELECT seed_role_permission('content_creator', 'can_share_projects', false);
SELECT seed_role_permission('content_creator', 'can_access_admin', false);
SELECT seed_role_permission('content_creator', 'can_view_analytics', false);
SELECT seed_role_permission('content_creator', 'can_view_team_analytics', false);
SELECT seed_role_permission('content_creator', 'can_manage_trusted_sources', false);
SELECT seed_role_permission('content_creator', 'can_tune_ai_agents', false);
SELECT seed_role_permission('content_creator', 'can_edit_master_ai', false);
SELECT seed_role_permission('content_creator', 'can_view_users', false);
SELECT seed_role_permission('content_creator', 'can_create_users', false);
SELECT seed_role_permission('content_creator', 'can_edit_users', false);
SELECT seed_role_permission('content_creator', 'can_delete_users', false);
SELECT seed_role_permission('content_creator', 'can_manage_teams', false);
SELECT seed_role_permission('content_creator', 'can_manage_api_keys', false);
SELECT seed_role_permission('content_creator', 'can_manage_sso', false);
SELECT seed_role_permission('content_creator', 'can_manage_tools', false);
SELECT seed_role_permission('content_creator', 'can_toggle_ai_agents', false);
SELECT seed_role_permission('content_creator', 'can_manage_role_permissions', false);
SELECT seed_role_permission('content_creator', 'can_edit_any_brief', false);
SELECT seed_role_permission('content_creator', 'can_delete_any_brief', false);

-- Team Leader permissions
SELECT seed_role_permission('team_leader', 'can_create_projects', true);
SELECT seed_role_permission('team_leader', 'can_edit_own_projects', true);
SELECT seed_role_permission('team_leader', 'can_delete_own_projects', true);
SELECT seed_role_permission('team_leader', 'can_use_smartbriefs', true);
SELECT seed_role_permission('team_leader', 'can_use_ai_agents', true);
SELECT seed_role_permission('team_leader', 'can_export_content', true);
SELECT seed_role_permission('team_leader', 'can_view_user_guide', true);
SELECT seed_role_permission('team_leader', 'can_manage_own_writer_model', true);
SELECT seed_role_permission('team_leader', 'can_share_projects', true);
SELECT seed_role_permission('team_leader', 'can_access_admin', true);
SELECT seed_role_permission('team_leader', 'can_view_analytics', true);
SELECT seed_role_permission('team_leader', 'can_view_team_analytics', true);
SELECT seed_role_permission('team_leader', 'can_manage_trusted_sources', true);
SELECT seed_role_permission('team_leader', 'can_tune_ai_agents', true);
SELECT seed_role_permission('team_leader', 'can_edit_master_ai', false);
SELECT seed_role_permission('team_leader', 'can_view_users', false);
SELECT seed_role_permission('team_leader', 'can_create_users', false);
SELECT seed_role_permission('team_leader', 'can_edit_users', false);
SELECT seed_role_permission('team_leader', 'can_delete_users', false);
SELECT seed_role_permission('team_leader', 'can_manage_teams', false);
SELECT seed_role_permission('team_leader', 'can_manage_api_keys', false);
SELECT seed_role_permission('team_leader', 'can_manage_sso', false);
SELECT seed_role_permission('team_leader', 'can_manage_tools', false);
SELECT seed_role_permission('team_leader', 'can_toggle_ai_agents', false);
SELECT seed_role_permission('team_leader', 'can_manage_role_permissions', false);
SELECT seed_role_permission('team_leader', 'can_edit_any_brief', true);
SELECT seed_role_permission('team_leader', 'can_delete_any_brief', false);

-- Manager permissions
SELECT seed_role_permission('manager', 'can_create_projects', true);
SELECT seed_role_permission('manager', 'can_edit_own_projects', true);
SELECT seed_role_permission('manager', 'can_delete_own_projects', true);
SELECT seed_role_permission('manager', 'can_use_smartbriefs', true);
SELECT seed_role_permission('manager', 'can_use_ai_agents', true);
SELECT seed_role_permission('manager', 'can_export_content', true);
SELECT seed_role_permission('manager', 'can_view_user_guide', true);
SELECT seed_role_permission('manager', 'can_manage_own_writer_model', true);
SELECT seed_role_permission('manager', 'can_share_projects', true);
SELECT seed_role_permission('manager', 'can_access_admin', true);
SELECT seed_role_permission('manager', 'can_view_analytics', true);
SELECT seed_role_permission('manager', 'can_view_team_analytics', true);
SELECT seed_role_permission('manager', 'can_manage_trusted_sources', true);
SELECT seed_role_permission('manager', 'can_tune_ai_agents', true);
SELECT seed_role_permission('manager', 'can_edit_master_ai', true);
SELECT seed_role_permission('manager', 'can_view_users', true);
SELECT seed_role_permission('manager', 'can_create_users', true);
SELECT seed_role_permission('manager', 'can_edit_users', false);
SELECT seed_role_permission('manager', 'can_delete_users', false);
SELECT seed_role_permission('manager', 'can_manage_teams', true);
SELECT seed_role_permission('manager', 'can_manage_api_keys', false);
SELECT seed_role_permission('manager', 'can_manage_sso', false);
SELECT seed_role_permission('manager', 'can_manage_tools', false);
SELECT seed_role_permission('manager', 'can_toggle_ai_agents', false);
SELECT seed_role_permission('manager', 'can_manage_role_permissions', false);
SELECT seed_role_permission('manager', 'can_edit_any_brief', true);
SELECT seed_role_permission('manager', 'can_delete_any_brief', true);

-- Admin permissions
SELECT seed_role_permission('admin', 'can_create_projects', true);
SELECT seed_role_permission('admin', 'can_edit_own_projects', true);
SELECT seed_role_permission('admin', 'can_delete_own_projects', true);
SELECT seed_role_permission('admin', 'can_use_smartbriefs', true);
SELECT seed_role_permission('admin', 'can_use_ai_agents', true);
SELECT seed_role_permission('admin', 'can_export_content', true);
SELECT seed_role_permission('admin', 'can_view_user_guide', true);
SELECT seed_role_permission('admin', 'can_manage_own_writer_model', true);
SELECT seed_role_permission('admin', 'can_share_projects', true);
SELECT seed_role_permission('admin', 'can_access_admin', true);
SELECT seed_role_permission('admin', 'can_view_analytics', true);
SELECT seed_role_permission('admin', 'can_view_team_analytics', true);
SELECT seed_role_permission('admin', 'can_manage_trusted_sources', true);
SELECT seed_role_permission('admin', 'can_tune_ai_agents', true);
SELECT seed_role_permission('admin', 'can_edit_master_ai', true);
SELECT seed_role_permission('admin', 'can_view_users', true);
SELECT seed_role_permission('admin', 'can_create_users', true);
SELECT seed_role_permission('admin', 'can_edit_users', true);
SELECT seed_role_permission('admin', 'can_delete_users', true);
SELECT seed_role_permission('admin', 'can_manage_teams', true);
SELECT seed_role_permission('admin', 'can_manage_api_keys', false);
SELECT seed_role_permission('admin', 'can_manage_sso', true);
SELECT seed_role_permission('admin', 'can_manage_tools', false);
SELECT seed_role_permission('admin', 'can_toggle_ai_agents', true);
SELECT seed_role_permission('admin', 'can_manage_role_permissions', false);
SELECT seed_role_permission('admin', 'can_edit_any_brief', true);
SELECT seed_role_permission('admin', 'can_delete_any_brief', true);

-- Super Admin permissions (all enabled)
SELECT seed_role_permission('super_admin', 'can_create_projects', true);
SELECT seed_role_permission('super_admin', 'can_edit_own_projects', true);
SELECT seed_role_permission('super_admin', 'can_delete_own_projects', true);
SELECT seed_role_permission('super_admin', 'can_use_smartbriefs', true);
SELECT seed_role_permission('super_admin', 'can_use_ai_agents', true);
SELECT seed_role_permission('super_admin', 'can_export_content', true);
SELECT seed_role_permission('super_admin', 'can_view_user_guide', true);
SELECT seed_role_permission('super_admin', 'can_manage_own_writer_model', true);
SELECT seed_role_permission('super_admin', 'can_share_projects', true);
SELECT seed_role_permission('super_admin', 'can_access_admin', true);
SELECT seed_role_permission('super_admin', 'can_view_analytics', true);
SELECT seed_role_permission('super_admin', 'can_view_team_analytics', true);
SELECT seed_role_permission('super_admin', 'can_manage_trusted_sources', true);
SELECT seed_role_permission('super_admin', 'can_tune_ai_agents', true);
SELECT seed_role_permission('super_admin', 'can_edit_master_ai', true);
SELECT seed_role_permission('super_admin', 'can_view_users', true);
SELECT seed_role_permission('super_admin', 'can_create_users', true);
SELECT seed_role_permission('super_admin', 'can_edit_users', true);
SELECT seed_role_permission('super_admin', 'can_delete_users', true);
SELECT seed_role_permission('super_admin', 'can_manage_teams', true);
SELECT seed_role_permission('super_admin', 'can_manage_api_keys', true);
SELECT seed_role_permission('super_admin', 'can_manage_sso', true);
SELECT seed_role_permission('super_admin', 'can_manage_tools', true);
SELECT seed_role_permission('super_admin', 'can_toggle_ai_agents', true);
SELECT seed_role_permission('super_admin', 'can_manage_role_permissions', true);
SELECT seed_role_permission('super_admin', 'can_edit_any_brief', true);
SELECT seed_role_permission('super_admin', 'can_delete_any_brief', true);

-- Clean up helper function
DROP FUNCTION IF EXISTS seed_role_permission(TEXT, TEXT, BOOLEAN);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_permission_overrides_updated_at
  BEFORE UPDATE ON user_permission_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
