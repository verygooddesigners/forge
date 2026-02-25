import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { NFLOddsPageClient } from './NFLOddsPageClient';

export const dynamic = 'force-dynamic';

export default async function NFLOddsPage() {
  const devUser = getDevUser();
  if (devUser) return <NFLOddsPageClient user={devUser} />;

  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user details
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  return <NFLOddsPageClient user={userData} />;
}
