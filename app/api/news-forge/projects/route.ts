import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('news_forge_projects')
    .select(`
      *,
      project:projects(id, headline, created_at, updated_at),
      site:news_sites(id, name, slug, state)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single();

    const {
      headline,
      site_id,
      selected_cities,
      selected_sports,
      selected_teams,
      sports_discovery,
      writer_model_id,
      brief_id,
    } = await req.json();

    if (!headline || !site_id) {
      return NextResponse.json({ error: 'Missing headline or site_id' }, { status: 400 });
    }

    // Get a default writer model if not provided
    let modelId = writer_model_id;
    if (!modelId) {
      const { data: models } = await supabase
        .from('writer_models')
        .select('id')
        .eq('is_house_model', true)
        .limit(1);
      modelId = models?.[0]?.id;
    }

    // Get a default brief if not provided
    let briefId = brief_id;
    if (!briefId) {
      const { data: briefs } = await supabase
        .from('briefs')
        .select('id')
        .eq('is_shared', true)
        .limit(1);
      briefId = briefs?.[0]?.id;
    }

    if (!modelId || !briefId) {
      return NextResponse.json(
        { error: 'No writer model or brief available. Please configure at least one house model and shared brief.' },
        { status: 422 }
      );
    }

    // Create base project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        headline,
        primary_keyword: selected_sports?.[0] || 'sports news',
        secondary_keywords: selected_teams?.map((t: any) => t.name || t) || [],
        topic: `${selected_sports?.[0] || 'sports'} news`,
        word_count_target: 600,
        writer_model_id: modelId,
        brief_id: briefId,
        content: {},
      })
      .select()
      .single();

    if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });

    // Create news forge metadata
    const { data: nfProject, error: nfError } = await supabase
      .from('news_forge_projects')
      .insert({
        project_id: project.id,
        site_id,
        selected_cities: selected_cities || [],
        selected_sports: selected_sports || [],
        selected_teams: selected_teams || [],
        sports_discovery: sports_discovery || null,
        research_status: 'pending',
      })
      .select()
      .single();

    if (nfError) return NextResponse.json({ error: nfError.message }, { status: 500 });

    return NextResponse.json({ project, nf_project: nfProject }, { status: 201 });
  } catch (err: any) {
    console.error('Create news forge project error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
