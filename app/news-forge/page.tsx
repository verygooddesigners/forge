import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewsForgePageClient } from './NewsForgePageClient';

export default async function NewsForgeHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return <NewsForgePageClient user={userData} />;
}
