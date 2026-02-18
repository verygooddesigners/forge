import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResearchArticle } from '@/types';

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

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build search query
    const query = [
      headline,
      primaryKeyword,
      ...(secondaryKeywords || []),
      topic
    ]
      .filter(Boolean)
      .join(' ');

    if (!query) {
      return NextResponse.json(
        { error: 'No search terms provided' },
        { status: 400 }
      );
    }

    // Load trusted sources from database
    const { data: trustedSources } = await supabase
      .from('trusted_sources')
      .select('domain, name, trust_level');

    const trustedSourcesMap = new Map(
      (trustedSources || []).map(s => [s.domain, s])
    );

    // Call Tavily API for news search
    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json(
        { error: 'News search service not configured' },
        { status: 503 }
      );
    }

    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        include_answer: false,
        include_images: true,
        include_raw_content: false,
        max_results: 15,
        days: 21, // Past 3 weeks
      }),
    });

    if (!tavilyResponse.ok) {
      console.error('Tavily API error:', await tavilyResponse.text());
      return NextResponse.json(
        { error: 'News search failed' },
        { status: 500 }
      );
    }

    const tavilyData = await tavilyResponse.json();

    // Transform and score results
    const articles: ResearchArticle[] = (tavilyData.results || []).map((result: any, index: number) => {
      const domain = (() => { try { return new URL(result.url).hostname.replace('www.', ''); } catch { return result.url || 'unknown'; } })();
      const trustedSource = trustedSourcesMap.get(domain);
      
      // Calculate trust score
      let trustScore = 0.5; // Default for unknown sources
      if (trustedSource) {
        switch (trustedSource.trust_level) {
          case 'high':
            trustScore = 0.9;
            break;
          case 'medium':
            trustScore = 0.7;
            break;
          case 'low':
            trustScore = 0.4;
            break;
          case 'untrusted':
            trustScore = 0.2;
            break;
        }
      }

      return {
        id: `research-${projectId}-${index}`,
        title: result.title,
        description: result.content,
        url: result.url,
        source: trustedSource?.name || domain,
        published_date: result.published_date || new Date().toISOString(),
        image_url: result.image_url,
        relevance_score: result.score || 0.5,
        trust_score: trustScore,
        is_trusted: trustScore >= 0.7,
        is_flagged: false,
        full_content: result.raw_content || result.content,
      };
    });

    // Sort by relevance score descending
    articles.sort((a, b) => b.relevance_score - a.relevance_score);

    const trusted_count = articles.filter(a => a.is_trusted).length;

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
