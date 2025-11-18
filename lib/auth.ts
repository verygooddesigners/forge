import { createClient } from './supabase/server';
import { User, UserRole } from '@/types';

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
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Check if current user has permission to access a resource
 */
export async function checkPermission(
  resourceOwnerId: string,
  allowedRoles: UserRole[] = ['admin']
): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // User owns the resource
  if (user.id === resourceOwnerId) return true;
  
  // User has an allowed role
  if (allowedRoles.includes(user.role)) return true;
  
  return false;
}


