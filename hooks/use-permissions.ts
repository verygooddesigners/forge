'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSuperAdmin } from '@/lib/super-admin';
import type { PermissionKey } from '@/types';

// All known permission keys — super admins get all of these set to true
const ALL_PERMISSION_KEYS: PermissionKey[] = [
  'can_create_projects',
  'can_edit_own_projects',
  'can_delete_own_projects',
  'can_share_projects',
  'can_use_smartbriefs',
  'can_edit_any_brief',
  'can_delete_any_brief',
  'can_export_content',
  'can_manage_own_writer_model',
  'can_use_ai_agents',
  'can_tune_ai_agents',
  'can_toggle_ai_agents',
  'can_edit_master_ai',
  'can_manage_trusted_sources',
  'can_view_analytics',
  'can_view_team_analytics',
  'can_view_users',
  'can_create_users',
  'can_edit_users',
  'can_delete_users',
  'can_manage_teams',
  'can_create_teams',
  'can_access_admin',
  'can_view_user_guide',
  'can_manage_api_keys',
  'can_manage_sso',
  'can_manage_tools',
  'can_manage_role_permissions',
];

function buildSuperAdminPermissions(): Record<string, boolean> {
  const perms: Record<string, boolean> = {};
  for (const key of ALL_PERMISSION_KEYS) {
    perms[key] = true;
  }
  return perms;
}

export function usePermissions(userId: string, userEmail?: string) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Super admins get all permissions immediately — no DB round-trip needed
    if (isSuperAdmin(userEmail)) {
      setPermissions(buildSuperAdminPermissions());
      setLoading(false);
      return;
    }

    async function fetchPermissions() {
      setLoading(true);
      const supabase = createClient();

      // Get user's current role
      const { data: profile } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', userId)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Double-check super admin by email from DB (in case email wasn't passed)
      if (isSuperAdmin(profile.email)) {
        setPermissions(buildSuperAdminPermissions());
        setLoading(false);
        return;
      }

      // Fetch role permissions and user overrides in parallel
      const [{ data: rolePerms }, { data: overrides }] = await Promise.all([
        supabase
          .from('role_permissions')
          .select('permission_key, enabled')
          .eq('role', profile.role),
        supabase
          .from('user_permission_overrides')
          .select('permission_key, enabled')
          .eq('user_id', userId),
      ]);

      const perms: Record<string, boolean> = {};

      // Role permissions first
      for (const row of rolePerms ?? []) {
        perms[row.permission_key] = row.enabled;
      }

      // User overrides take precedence
      for (const row of overrides ?? []) {
        perms[row.permission_key] = row.enabled;
      }

      setPermissions(perms);
      setLoading(false);
    }

    fetchPermissions();
  }, [userId, userEmail]);

  function hasPermission(key: string): boolean {
    return permissions[key] === true;
  }

  return { permissions, loading, hasPermission };
}
