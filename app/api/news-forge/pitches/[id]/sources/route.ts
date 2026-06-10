import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH: update a source's status (used/blocked/neutral)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: pitchId } = await params;
  const { source_id, status } = await req.json();

  if (!source_id || !['neutral', 'used', 'blocked'].includes(status)) {
    return NextResponse.json({ error: 'Invalid source_id or status' }, { status: 400 });
  }

  // Verify ownership via pitch -> project -> user
  const { data: pitch } = await supabase
    .from('news_forge_pitches')
    .select('project_id')
    .eq('id', pitchId)
    .single();
  if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', pitch.project_id)
    .eq('user_id', user.id)
    .single();
  if (!project) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { data, error } = await supabase
    .from('news_forge_pitch_sources')
    .update({ status })
    .eq('id', source_id)
    .eq('pitch_id', pitchId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ source: data });
}
