// Permission checking utilities for RotoWrite Tools system

import { createClient } from '@/lib/supabase/server';
import type { PermissionCheckResult, ToolPermission } from '@/types/tools';

/**
 * Check if a user has a specific tool installed and enabled
 */
export async function isToolInstalledAndEnabled(
  userId: string,
  toolId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_installed_tools')
    .select('enabled')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .single();

  if (error || !data) return false;
  return data.enabled;
}

/**
 * Check if a tool has been granted a specific permission
 */
export async function checkToolPermission(
  toolId: string,
  userId: string,
  permission: string
): Promise<PermissionCheckResult> {
  const supabase = await createClient();

  // First, check if the tool is installed and enabled for this user
  const isInstalled = await isToolInstalledAndEnabled(userId, toolId);
  if (!isInstalled) {
    return {
      granted: false,
      permission,
      reason: 'Tool is not installed or is disabled',
    };
  }

  // Get the tool's requested permissions
  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .select('permissions_requested, status')
    .eq('id', toolId)
    .single();

  if (toolError || !tool) {
    return {
      granted: false,
      permission,
      reason: 'Tool not found',
    };
  }

  if (tool.status !== 'approved') {
    return {
      granted: false,
      permission,
      reason: 'Tool is not approved',
    };
  }

  // Check if the permission is in the tool's requested permissions
  const permissions = tool.permissions_requested as string[];
  if (!permissions.includes(permission)) {
    return {
      granted: false,
      permission,
      reason: 'Permission not requested by tool',
    };
  }

  return {
    granted: true,
    permission,
  };
}

/**
 * Check multiple permissions at once
 */
export async function checkToolPermissions(
  toolId: string,
  userId: string,
  permissions: string[]
): Promise<PermissionCheckResult[]> {
  return Promise.all(
    permissions.map((permission) =>
      checkToolPermission(toolId, userId, permission)
    )
  );
}

/**
 * Get all permissions for a tool
 */
export async function getToolPermissions(toolId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tools')
    .select('permissions_requested')
    .eq('id', toolId)
    .single();

  if (error || !data) return [];
  return (data.permissions_requested as string[]) || [];
}

/**
 * Get permission definitions from the database
 */
export async function getPermissionDefinitions(): Promise<ToolPermission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tool_permissions')
    .select('*')
    .order('risk_level', { ascending: true })
    .order('display_name', { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Get permission definition by key
 */
export async function getPermissionDefinition(
  permissionKey: string
): Promise<ToolPermission | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tool_permissions')
    .select('*')
    .eq('permission_key', permissionKey)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Validate that all requested permissions exist
 */
export async function validatePermissions(
  permissions: string[]
): Promise<{ valid: boolean; invalidPermissions: string[] }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tool_permissions')
    .select('permission_key')
    .in('permission_key', permissions);

  if (error) {
    return { valid: false, invalidPermissions: permissions };
  }

  const validPermissions = data.map((p) => p.permission_key);
  const invalidPermissions = permissions.filter(
    (p) => !validPermissions.includes(p)
  );

  return {
    valid: invalidPermissions.length === 0,
    invalidPermissions,
  };
}

/**
 * Middleware helper to check tool permissions in API routes
 */
export async function requireToolPermission(
  toolId: string,
  userId: string,
  permission: string
): Promise<void> {
  const result = await checkToolPermission(toolId, userId, permission);
  
  if (!result.granted) {
    throw new Error(
      `Permission denied: ${result.reason || 'Unknown reason'}`
    );
  }
}

/**
 * Get all tools a user has installed with their permissions
 */
export async function getUserToolsWithPermissions(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_installed_tools')
    .select(`
      *,
      tool:tools (
        id,
        name,
        slug,
        permissions_requested,
        sidebar_label,
        sidebar_icon,
        sidebar_order
      )
    `)
    .eq('user_id', userId)
    .eq('enabled', true)
    .order('tool.sidebar_order', { ascending: true });

  if (error || !data) return [];
  return data;
}
