import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // TEMPORARILY DISABLED FOR SCREENSHOTS - Create mock user for demo
  const mockUser = {
    id: 'demo-user-id',
    email: 'demo@rotowrite.com',
    full_name: 'Demo User',
    role: 'user',
    account_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <DashboardLayout user={mockUser} />;
  
  // try {
  //   const supabase = await createClient();
  //   const { data: { user } } = await supabase.auth.getUser();

  //   if (!user) {
  //     redirect('/login');
  //   }

  //   // Get user profile with role
  //   const { data: profile } = await supabase
  //     .from('users')
  //     .select('*')
  //     .eq('id', user.id)
  //     .single();

  //   if (!profile) {
  //     redirect('/login');
  //   }

  //   return <DashboardLayout user={profile} />;
  // } catch (error) {
  //   // If Supabase is not configured, redirect to login
  //   redirect('/login');
  // }
}


