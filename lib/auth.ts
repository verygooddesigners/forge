import { createClient } from './supabase/server';
import { User } from '@/types';
import { getUserPermissions } from './auth-config';

/**
 * Get the current user from the session
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  return user;
}

/**
 * Check if current user has a specific permission
 */
export async function checkPermissionByKey(permissionKey: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const perms = await getUserPermissions(user.id);
  return perms[permissionKey] === true;
}

/**
 * Check if current user can access a resource (owns it or has a permission)
 */
export async function checkPermission(
  resourceOwnerId: string,
  permissionKey: string = 'can_edit_users'
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.id === resourceOwnerId) return true;
  const perms = await getUserPermissions(user.id);
  return perms[permissionKey] === true;
}
