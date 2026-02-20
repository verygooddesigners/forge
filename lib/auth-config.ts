// Centralized permission configuration
// Roles are now dynamic (stored in DB). Permissions are DB-driven via role_permissions + user_permission_overrides.

import { createClient } from '@/lib/supabase/server';
import { PermissionKey, User } from '@/types';
import { isSuperAdmin } from '@/lib/super-admin';

export { isSuperAdmin };

/**
 * Fetch all permissions for a user.
 * Merges role_permissions + user_permission_overrides (overrides take precedence).
 */
export async function getUserPermissions(userId: string): Promise<Record<string, boolean>> {
  const supabase = await createClient();

  // Get user's role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) return {};

  // Get role permissions
  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('permission_key, enabled')
    .eq('role', profile.role);

  // Get user overrides
  const { data: overrides } = await supabase
    .from('user_permission_overrides')
    .select('permission_key, enabled')
    .eq('user_id', userId);

  const perms: Record<string, boolean> = {};

  // Apply role permissions first
  for (const row of rolePerms ?? []) {
    perms[row.permission_key] = row.enabled;
  }

  // Apply user overrides (take precedence)
  for (const row of overrides ?? []) {
    perms[row.permission_key] = row.enabled;
  }

  return perms;
}

/**
 * Check if a user has a specific permission. Async, hits the DB.
 */
export async function hasPermission(userId: string, key: PermissionKey): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms[key] === true;
}

/**
 * Sync check from a pre-fetched permissions map.
 */
export function checkPermissionFromMap(perms: Record<string, boolean>, key: string): boolean {
  return perms[key] === true;
}

/**
 * Helper for API routes: verifies auth, fetches user profile, checks permission.
 * Returns { user, allowed } — the route handles the response.
 */
export async function checkApiPermission(
  permissionKey: PermissionKey
): Promise<{ user: User | null; allowed: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return { user: null, allowed: false };

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) return { user: null, allowed: false };

    // Super admin email check is always a fallback
    if (isSuperAdmin(profile.email)) {
      return { user: profile as User, allowed: true };
    }

    const perms = await getUserPermissions(authUser.id);
    return { user: profile as User, allowed: perms[permissionKey] === true };
  } catch {
    return { user: null, allowed: false };
  }
}
