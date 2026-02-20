import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SmartBriefsPageClient } from './SmartBriefsPageClient';

export const dynamic = 'force-dynamic';

export default async function SmartBriefsPage() {
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

  return <SmartBriefsPageClient user={userData} />;
}
