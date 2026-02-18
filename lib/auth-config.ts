// Centralized role-based permission configuration
// Role hierarchy: super_admin > admin > manager > team_leader > content_creator

import { UserRole, ROLE_LEVELS } from '@/types';

// Super admin emails — these users are automatically assigned super_admin role
const SUPER_ADMIN_EMAILS = new Set([
  'jeremy.botter@gdcgroup.com',
  'jeremy.botter@gmail.com',
]);

export function isSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.has(email);
}

/**
 * Check if a role meets the minimum required role level
 */
export function hasMinimumRole(userRole: UserRole | undefined | null, minimumRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minimumRole];
}

/**
 * Get the maximum role a user can assign to others.
 * Super Admin can assign up to Super Admin.
 * Admin can assign up to Manager.
 * Manager can assign up to Team Leader.
 * Others cannot assign roles.
 */
export function getMaxAssignableRole(userRole: UserRole): UserRole | null {
  switch (userRole) {
    case 'super_admin': return 'super_admin';
    case 'admin': return 'manager';
    case 'manager': return 'team_leader';
    default: return null;
  }
}

/**
 * Get the list of roles a user can assign, from lowest to highest
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  const maxRole = getMaxAssignableRole(userRole);
  if (!maxRole) return [];

  const allRoles: UserRole[] = ['content_creator', 'team_leader', 'manager', 'admin', 'super_admin'];
  const maxLevel = ROLE_LEVELS[maxRole];
  return allRoles.filter(r => ROLE_LEVELS[r] <= maxLevel);
}

// ============================================================================
// Permission check functions
// ============================================================================

/** Can access the admin panel (team_leader+) */
export function canAccessAdmin(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'team_leader');
}

/** Can view user list / Manage All Users (manager+) */
export function canViewUsers(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'manager');
}

/** Can manage/create/edit teams (manager+) */
export function canManageTeams(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'manager');
}

/** Can create/invite users (manager+) */
export function canCreateUsers(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'manager');
}

/** Can edit user profiles and change roles (admin+) */
export function canEditUsers(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'admin');
}

/** Can delete users (admin+) */
export function canDeleteUsers(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'admin');
}

/** Can edit master AI instructions / AI Tuner (manager+) */
export function canEditMasterInstructions(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'manager');
}

/** Can tune individual AI agents — temperature, prompts, models (team_leader+) */
export function canTuneAgents(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'team_leader');
}

/** Can enable/disable AI agents (admin+) */
export function canToggleAgents(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'admin');
}

/** Can manage API keys (super_admin only) */
export function canManageApiKeys(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'super_admin');
}

/** Can manage SSO configuration (admin+) */
export function canManageSso(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'admin');
}

/** Can manage trusted sources (team_leader+) */
export function canManageTrustedSources(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'team_leader');
}

/** Can access Cursor Remote (super_admin only) */
export function canAccessCursorRemote(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'super_admin');
}

/** Can edit any brief (team_leader+ can edit any, content_creator only their own) */
export function canEditAnyBrief(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'team_leader');
}

/** Can delete any brief (manager+) */
export function canDeleteAnyBrief(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'manager');
}

/** Can manage tools (super_admin only) */
export function canManageTools(role: UserRole | undefined | null): boolean {
  return hasMinimumRole(role, 'super_admin');
}
