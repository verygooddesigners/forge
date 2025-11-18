import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { headline, primaryKeyword, secondaryKeywords } = await request.json();

    if (!headline && !primaryKeyword) {
      return NextResponse.json(
        { error: 'At least headline or primary keyword required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build search query
    const query = [headline, primaryKeyword, ...(secondaryKeywords || [])]
      .filter(Boolean)
      .join(' ');

    // Call Tavily API
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        include_answer: false,
        include_images: true,
        include_raw_content: false,
        max_results: 10,
        days: 21, // Past 3 weeks
      }),
    });

    if (!response.ok) {
      throw new Error('Tavily API error');
    }

    const data = await response.json();

    // Transform results to our format
    const articles = data.results?.map((result: any) => ({
      title: result.title,
      description: result.content,
      url: result.url,
      source: new URL(result.url).hostname,
      published_date: result.published_date || new Date().toISOString(),
      image_url: result.image_url,
      relevance_score: result.score || 0,
    })) || [];

    // Sort by relevance score
    articles.sort((a: any, b: any) => b.relevance_score - a.relevance_score);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error in news search:', error);
    return NextResponse.json(
      { error: 'Failed to search news' },
      { status: 500 }
    );
  }
}


