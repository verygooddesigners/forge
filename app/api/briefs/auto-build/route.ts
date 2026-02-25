import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/agents/content-generation';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'Please provide a URL' }, { status: 400 });
    }

    // Fetch content from the URL
    let pageContent = '';
    try {
      const response = await fetch(url.trim(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Forge/1.0; +https://forge.com)',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      pageContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Could not fetch the URL: ${error.message}` },
        { status: 400 }
      );
    }

    if (!pageContent || pageContent.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract sufficient content from this URL. The page may require JavaScript or block automated access.' },
        { status: 400 }
      );
    }

    const prompt = `You are a SmartBrief architect for Forge, an AI content generation platform.

Your task is to analyze a piece of content and reverse-engineer a reusable SmartBrief template that could be used to generate similar content in the future.

A SmartBrief has four components:
1. name - A short, descriptive template name (e.g., "NFL Single Game Preview", "Player Injury Report")
2. description - One sentence shown in the brief browser explaining what this template produces
3. aiInstructions - Detailed guidance for the AI: tone, voice, style, required data points, structure approach, and anything else the AI needs to know to write this type of content well
4. scaffold - A TipTap document (JSON) that defines the structural outline with headings and short placeholder notes under each heading describing what goes there

Source URL: ${url}

Article Content:
${pageContent}

TipTap Document Format (scaffold must follow this exactly):
{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Section Name"}]},{"type":"paragraph","content":[{"type":"text","text":"[Brief note on what this section should cover]"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Another Section"}]},{"type":"paragraph","content":[{"type":"text","text":"[Brief note on what this section should cover]"}]}]}

Instructions:
- Analyze the article structure, tone, style, and content patterns deeply
- The scaffold should mirror the actual section structure of the article
- The aiInstructions should be thorough enough that an AI could write a fresh version of this type of article without seeing the original
- Return ONLY a valid JSON object with no markdown, no backticks, no explanation outside the JSON

Return this exact structure:
{"name":"SmartBrief name","description":"One sentence description","aiInstructions":"Detailed AI guidance...","scaffold":{"type":"doc","content":[...]}}`;

    const result = await generateContent({
      brief: prompt,
      primaryKeywords: [],
      secondaryKeywords: [],
      targetWordCount: 600,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || 'Failed to analyze content');
    }

    // Extract and parse the JSON response
    let parsed;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('AI returned an unexpected response format. Please try again.');
    }

    if (!parsed.name || !parsed.scaffold) {
      throw new Error('AI response was incomplete. Please try again.');
    }

    return NextResponse.json({
      success: true,
      name: parsed.name || '',
      description: parsed.description || '',
      aiInstructions: parsed.aiInstructions || '',
      scaffold: parsed.scaffold || null,
    });
  } catch (error: any) {
    console.error('[AutoBuild] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
