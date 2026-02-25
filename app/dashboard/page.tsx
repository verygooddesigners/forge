import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { DashboardPageClient } from './DashboardPageClient';

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const devUser = getDevUser();
  if (devUser) return <DashboardPageClient user={devUser} />;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get user profile with role
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      redirect('/login');
    }

    return <DashboardPageClient user={profile} />;
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/login');
  }
}


