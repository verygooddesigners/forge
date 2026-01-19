import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsPageClient } from '@/components/settings/SettingsPageClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Get full user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return <SettingsPageClient user={profile} />;
}
