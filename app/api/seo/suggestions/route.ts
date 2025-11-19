import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SEOEngine } from '@/lib/seo-engine';

export async function POST(request: NextRequest) {
  try {
    const { content, primaryKeyword, secondaryKeywords, wordCount } = await request.json();

    if (!content || !primaryKeyword) {
      return NextResponse.json(
        { error: 'Content and primary keyword required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use SEO Engine to generate AI-powered suggestions
    const seoEngine = new SEOEngine(content, {
      headline: '',
      primaryKeyword,
      secondaryKeywords: secondaryKeywords || [],
      wordCount,
    });

    const suggestions = await seoEngine.generateAISuggestions();

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating SEO suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}


