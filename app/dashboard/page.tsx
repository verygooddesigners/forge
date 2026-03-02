import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardHome user={user} />;
}
