import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { ChangePasswordClient } from './ChangePasswordClient';

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  const devUser = getDevUser();
  if (devUser) return <ChangePasswordClient />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <ChangePasswordClient />;
}
