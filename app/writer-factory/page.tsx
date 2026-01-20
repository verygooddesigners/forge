import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WriterFactoryPageClient } from './WriterFactoryPageClient';

export default async function WriterFactoryPage() {
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

  return <WriterFactoryPageClient user={userData} />;
}
