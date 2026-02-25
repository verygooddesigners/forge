import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { ContentAnalyticsClient } from './ContentAnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function ContentAnalyticsPage() {
  const devUser = getDevUser();
  if (devUser) return <ContentAnalyticsClient user={devUser} />;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) redirect('/login');

    return <ContentAnalyticsClient user={profile} />;
  } catch {
    redirect('/login');
  }
}
