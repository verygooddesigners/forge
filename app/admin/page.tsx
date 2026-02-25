import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { AdminPageClient } from '@/components/admin/AdminPageClient';
import { getUserPermissions, isSuperAdmin } from '@/lib/auth-config';

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const devUser = getDevUser();
  if (devUser) return (
    <Suspense fallback={<div className="min-h-screen bg-bg-deepest flex items-center justify-center">Loading...</div>}>
      <AdminPageClient user={devUser} />
    </Suspense>
  );

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
      redirect('/dashboard');
    }

    // Super admin email is always allowed
    const isSuper = isSuperAdmin(profile.email);
    let canAccessAdmin = isSuper;

    if (!isSuper) {
      const perms = await getUserPermissions(user.id);
      canAccessAdmin = perms['can_access_admin'] === true;
    }

    if (!canAccessAdmin) {
      redirect('/dashboard');
    }

    return (
      <Suspense fallback={<div className="min-h-screen bg-bg-deepest flex items-center justify-center">Loading...</div>}>
        <AdminPageClient user={profile} />
      </Suspense>
    );
  } catch (error) {
    redirect('/login');
  }
}
