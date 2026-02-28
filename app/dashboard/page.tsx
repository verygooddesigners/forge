import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Profile missing — the DB trigger likely failed during signup.
      // Auto-provision to prevent the redirect loop: dashboard→/login→dashboard.
      const admin = createAdminClient();
      await admin.from('users').upsert(
        { id: user.id, email: user.email!, role: 'Content Creator', account_status: 'confirmed' },
        { onConflict: 'id', ignoreDuplicates: false },
      );
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = newProfile;
    }

    if (!profile) {
      // Still no profile after provisioning attempt — something is wrong, bail out
      redirect('/login');
    }

    return <DashboardPageClient user={profile} />;
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/login');
  }
}


