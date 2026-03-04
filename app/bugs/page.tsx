import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { BugsPageClient } from './BugsPageClient';

export const dynamic = 'force-dynamic';

export default async function BugsPage() {
  const devUser = getDevUser();
  if (devUser) return <BugsPageClient user={devUser} />;

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData) redirect('/login');

  return <BugsPageClient user={userData} />;
}
