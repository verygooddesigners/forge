import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if caller is privileged (admin / super admin can access any project's research)
  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  const isPrivileged =
    userRow?.role === 'Super Administrator' || userRow?.role === 'admin';

  // Verify project access
  let projectQuery = supabase.from('projects').select('id').eq('id', projectId);
  if (!isPrivileged) {
    projectQuery = projectQuery.eq('user_id', user.id);
  }
  const { data: project } = await projectQuery.single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
  }

  // Fetch research data
  const { data: research, error } = await supabase
    .from('project_research')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Failed to load research data' }, { status: 500 });
  }

  return NextResponse.json({ research: research ?? null });
}

// PATCH /api/research/load — update selected_story_ids for a project
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { projectId, selected_story_ids } = body;

  if (!projectId || !Array.isArray(selected_story_ids)) {
    return NextResponse.json({ error: 'Missing projectId or selected_story_ids' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  const isPrivileged =
    userRow?.role === 'Super Administrator' || userRow?.role === 'admin';

  let projectQuery = supabase.from('projects').select('id').eq('id', projectId);
  if (!isPrivileged) {
    projectQuery = projectQuery.eq('user_id', user.id);
  }
  const { data: project } = await projectQuery.single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
  }

  const { error } = await supabase
    .from('project_research')
    .update({ selected_story_ids, updated_at: new Date().toISOString() })
    .eq('project_id', projectId);

  if (error) {
    return NextResponse.json({ error: 'Failed to update selection' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
