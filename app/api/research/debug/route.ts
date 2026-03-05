import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Temporary debug endpoint — remove after diagnosing research stories issue
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

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isPrivileged =
    userRow?.role === 'Super Administrator' || userRow?.role === 'admin';

  if (!isPrivileged) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  // Raw project_research row
  const { data: research, error: resErr } = await supabase
    .from('project_research')
    .select('id, project_id, status, loops_completed, updated_at, selected_story_ids')
    .eq('project_id', projectId)
    .single();

  // Count stories separately to avoid huge payload
  const { data: storiesCount } = await supabase
    .from('project_research')
    .select('stories')
    .eq('project_id', projectId)
    .single();

  const storiesRaw = storiesCount?.stories;
  const storiesInfo = {
    type: typeof storiesRaw,
    is_array: Array.isArray(storiesRaw),
    length: Array.isArray(storiesRaw) ? storiesRaw.length : (storiesRaw ? 'non-array' : 'null/undefined'),
    first_item_keys: Array.isArray(storiesRaw) && storiesRaw.length > 0 ? Object.keys(storiesRaw[0]) : [],
  };

  // Check projects.research_brief
  const { data: proj, error: projErr } = await supabase
    .from('projects')
    .select('research_brief')
    .eq('id', projectId)
    .single();

  const briefArticles = (proj?.research_brief as any)?.articles;

  return NextResponse.json({
    user: { id: user.id, role: userRow?.role },
    project_research: research ?? null,
    project_research_error: resErr?.message ?? null,
    stories_info: storiesInfo,
    research_brief: {
      has_articles: Array.isArray(briefArticles),
      article_count: Array.isArray(briefArticles) ? briefArticles.length : 0,
      error: projErr?.message ?? null,
    },
  });
}
