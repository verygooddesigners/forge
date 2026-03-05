import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, key);
}

// POST /api/research/remove-story — remove a manually-added story from project_research
export async function POST(request: NextRequest) {
  try {
    const { projectId, storyId } = await request.json();

    if (!projectId || !storyId) {
      return NextResponse.json({ error: 'Missing projectId or storyId' }, { status: 400 });
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

    const db = isPrivileged ? getServiceClient() : supabase;

    const { data: existing } = await db
      .from('project_research')
      .select('stories, selected_story_ids')
      .eq('project_id', projectId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'No research found for this project' }, { status: 404 });
    }

    let stories: any[] = [];
    if (Array.isArray(existing.stories)) {
      stories = existing.stories;
    } else if (typeof existing.stories === 'string') {
      try { stories = JSON.parse(existing.stories); } catch { stories = []; }
    }

    // Only allow removal of manually-added stories
    const target = stories.find((s: any) => s.id === storyId);
    if (!target) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    if (!target.is_manual) {
      return NextResponse.json({ error: 'Only manually-added stories can be removed' }, { status: 403 });
    }

    const updatedStories = stories.filter((s: any) => s.id !== storyId);
    const updatedSelectedIds = (existing.selected_story_ids || []).filter(
      (id: string) => id !== storyId
    );

    const { error } = await db
      .from('project_research')
      .update({
        stories: updatedStories,
        selected_story_ids: updatedSelectedIds,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId);

    if (error) {
      return NextResponse.json({ error: 'Failed to remove story' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Remove story error:', error);
    return NextResponse.json(
      { error: 'Failed to remove story', details: error.message },
      { status: 500 }
    );
  }
}
