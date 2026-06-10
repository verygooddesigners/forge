import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET pitches for a project
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const project_id = searchParams.get('project_id');
  if (!project_id) return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 403 });

  const { data, error } = await supabase
    .from('news_forge_pitches')
    .select('*, sources:news_forge_pitch_sources(*)')
    .eq('project_id', project_id)
    .order('position');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pitches: data });
}
