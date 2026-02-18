import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SEOEngine } from '@/lib/seo-engine';

export async function POST(request: NextRequest) {
  try {
    const { projectId, content } = await request.json();

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'Project ID and content required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project details (verify ownership)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('headline, primary_keyword, secondary_keywords')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get other projects from the user for internal linking
    const { data: otherProjects } = await supabase
      .from('projects')
      .select('id, headline, primary_keyword, topic')
      .eq('user_id', user.id)
      .neq('id', projectId)
      .limit(10);

    // Format available articles for linking
    const availableArticles = (otherProjects || []).map(p => ({
      title: p.headline,
      url: `/projects/${p.id}`,
      topic: p.primary_keyword || p.topic || '',
    }));

    // Use SEO Engine to suggest internal links
    const seoEngine = new SEOEngine(content, {
      headline: project.headline,
      primaryKeyword: project.primary_keyword,
      secondaryKeywords: project.secondary_keywords || [],
    });

    const suggestions = await seoEngine.suggestInternalLinks(availableArticles);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error generating internal links:', error);
    return NextResponse.json(
      { error: 'Failed to generate internal link suggestions' },
      { status: 500 }
    );
  }
}

