import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewsForgeProjectClient } from './NewsForgeProjectClient';

export default async function NewsForgeProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Load project + NF metadata
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) notFound();

  const { data: nfProject } = await supabase
    .from('news_forge_projects')
    .select('*, site:news_sites(*)')
    .eq('project_id', id)
    .single();

  if (!nfProject) notFound();

  // Load pitches with sources
  const { data: pitches } = await supabase
    .from('news_forge_pitches')
    .select('*, sources:news_forge_pitch_sources(*)')
    .eq('project_id', id)
    .order('position');

  return (
    <NewsForgeProjectClient
      user={userData}
      project={project}
      nfProject={nfProject}
      initialPitches={pitches || []}
    />
  );
}
