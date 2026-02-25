import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadTrustedSources, searchTavily } from '@/lib/research';

export async function POST(request: NextRequest) {
  try {
    const { projectId, headline, primaryKeyword, secondaryKeywords, topic } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = [headline, primaryKeyword, ...(secondaryKeywords || []), topic]
      .filter(Boolean)
      .join(' ');

    if (!query) {
      return NextResponse.json(
        { error: 'No search terms provided' },
        { status: 400 }
      );
    }

    const trustedSourcesMap = await loadTrustedSources(supabase);
    const articles = await searchTavily(
      query,
      trustedSourcesMap,
      { max_results: 15, days: 21, search_depth: 'advanced' },
      `research-${projectId}`
    );

    const trusted_count = articles.filter((a) => a.is_trusted).length;

    return NextResponse.json({
      articles,
      trusted_count,
      total_count: articles.length,
      research_id: `research-${projectId}-${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error in research story:', error);
    return NextResponse.json(
      { error: 'Failed to research story', details: error.message },
      { status: 500 }
    );
  }
}
