import { createClient } from './supabase/server';
import { User, UserRole } from '@/types';
import { hasMinimumRole } from './auth-config';

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
 * Check if current user has at least the specified role
 */
export async function checkRole(minimumRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return hasMinimumRole(user?.role as UserRole, minimumRole);
}

/**
 * Check if current user is an admin (admin or above)
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole('admin');
}

/**
 * Check if current user has permission to access a resource
 */
export async function checkPermission(
  resourceOwnerId: string,
  minimumRole: UserRole = 'admin'
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) return false;

  // User owns the resource
  if (user.id === resourceOwnerId) return true;

  // User has the minimum required role
  if (hasMinimumRole(user.role as UserRole, minimumRole)) return true;

  return false;
}
