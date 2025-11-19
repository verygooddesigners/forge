import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SEOEngine } from '@/lib/seo-engine';

export async function POST(request: NextRequest) {
  try {
    const { projectId, content, suggestions } = await request.json();

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

    // Get project to extract SEO package
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('headline, primary_keyword, secondary_keywords, word_count_target')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Use SEO Engine for auto-optimization
    const seoEngine = new SEOEngine(content, {
      headline: project.headline,
      primaryKeyword: project.primary_keyword,
      secondaryKeywords: project.secondary_keywords || [],
      wordCount: project.word_count_target,
    });

    // If suggestions not provided, generate them first
    const optimizationSuggestions = suggestions || await seoEngine.generateAISuggestions();
    
    // Apply auto-optimization
    const optimizedContent = await seoEngine.autoOptimize(optimizationSuggestions);

    return NextResponse.json({
      success: true,
      suggestions: optimizationSuggestions,
      optimizedContent,
    });
  } catch (error) {
    console.error('Error in auto-optimize:', error);
    return NextResponse.json(
      { error: 'Failed to optimize content' },
      { status: 500 }
    );
  }
}

