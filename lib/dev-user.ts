import { User } from '@/types';

/**
 * Returns a mock user when NEXT_PUBLIC_DEV_BYPASS_AUTH=true in development.
 * This is only ever active locally — .env.local is gitignored and the
 * NODE_ENV guard ensures it can never run in production.
 */
export function getDevUser(): User | null {
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== 'true'
  ) {
    return null;
  }

  return {
    id: 'dev-user-00000000-0000-0000-0000-000000000000',
    email: 'jeremy.botter@gmail.com',
    full_name: 'Jeremy Botter',
    role: 'Super Administrator',
    account_status: 'confirmed' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User;
}
