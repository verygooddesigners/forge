import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

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

    if (!profile || profile.role !== 'admin') {
      redirect('/dashboard');
    }

    return <AdminDashboard user={profile} />;
  } catch (error) {
    // If Supabase is not configured, redirect to login
    redirect('/login');
  }
}


