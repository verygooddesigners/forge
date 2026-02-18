import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminPageClient } from '@/components/admin/AdminPageClient';
import { canAccessAdmin } from '@/lib/auth-config';
import { UserRole } from '@/types';

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
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

    if (!profile || !canAccessAdmin(profile.role as UserRole)) {
      redirect('/dashboard');
    }

    return <AdminPageClient user={profile} />;
  } catch (error) {
    // If Supabase is not configured, redirect to login
    redirect('/login');
  }
}


