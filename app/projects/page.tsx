import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectsPageClient } from './ProjectsPageClient';

export default async function ProjectsPage() {
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

  return <ProjectsPageClient user={userData} />;
}
