import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDevUser } from '@/lib/dev-user';
import { NewProjectPageClient } from './NewProjectPageClient';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const devUser = getDevUser();
  if (devUser) return <NewProjectPageClient user={devUser} />;

  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  return <NewProjectPageClient user={userData} />;
}
