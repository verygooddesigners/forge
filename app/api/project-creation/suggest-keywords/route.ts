import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateKeywordSuggestions } from '@/lib/agents/seo-optimization';

export async function POST(request: NextRequest) {
  try {
    const { headline, primaryKeyword } = await request.json();

    if (!headline || !primaryKeyword) {
      return NextResponse.json(
        { error: 'Headline and primary keyword are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the SEO agent to generate keyword suggestions based on headline + primary keyword
    const topic = `${headline} (primary keyword: ${primaryKeyword})`;
    const result = await generateKeywordSuggestions(topic, [primaryKeyword]);

    if (!result.success || !result.content) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate suggestions' },
        { status: 500 }
      );
    }

    // Parse the JSON response from the agent
    let keywords: string[] = [];
    try {
      // Extract JSON from the response (may be wrapped in markdown code blocks)
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Combine secondary and longTail keywords (exclude primary since user already has that)
        keywords = [
          ...(parsed.secondary || []),
          ...(parsed.longTail || []),
        ];
      }
    } catch {
      // If JSON parsing fails, try to extract keywords from plain text
      keywords = result.content
        .split(/[,\n]/)
        .map((k: string) => k.replace(/^[-*\d.)\s]+/, '').trim())
        .filter((k: string) => k.length > 0 && k.length < 100);
    }

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Error suggesting keywords:', error);
    return NextResponse.json(
      { error: 'Failed to generate keyword suggestions' },
      { status: 500 }
    );
  }
}
