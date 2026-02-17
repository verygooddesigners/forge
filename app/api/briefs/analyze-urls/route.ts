import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/agents/content-generation';

export async function POST(request: NextRequest) {
  try {
    const { urls, instructions } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one URL to analyze' },
        { status: 400 }
      );
    }

    if (!instructions || !instructions.trim()) {
      return NextResponse.json(
        { error: 'Please provide AI instructions' },
        { status: 400 }
      );
    }

    // Fetch content from URLs
    const urlContents: { url: string; content: string; error?: string }[] = [];
    
    for (const url of urls.slice(0, 3)) { // Limit to 3 URLs max to avoid timeouts
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Forge/1.0; +https://forge.com)',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout per URL
        });

        if (!response.ok) {
          urlContents.push({
            url,
            content: '',
            error: `HTTP ${response.status}`,
          });
          continue;
        }

        const html = await response.text();
        
        // Extract main content (simple text extraction)
        // Remove script and style tags
        const cleaned = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Limit content to first 5000 characters to avoid token limits
        urlContents.push({
          url,
          content: cleaned.substring(0, 5000),
        });
      } catch (error: any) {
        urlContents.push({
          url,
          content: '',
          error: error.message || 'Failed to fetch',
        });
      }
    }

    // Build analysis prompt
    const analysisPrompt = `You are analyzing example articles to extract patterns and guidelines for a content brief.

**Brief Context:**
${instructions}

**Example URLs and Content:**
${urlContents.map((item, idx) => `
URL ${idx + 1}: ${item.url}
${item.error ? `[Error: ${item.error}]` : `Content Preview:\n${item.content.substring(0, 2000)}`}
`).join('\n---\n')}

**Your Task:**
Analyze the example articles and extract:

1. **Content Structure**: What sections, headings, and organization patterns do you see?
2. **Tone & Style**: How would you describe the writing voice? (formal/casual, analytical/conversational, etc.)
3. **Key Information Types**: What specific data points, stats, or information are consistently included?
4. **Formatting Patterns**: Are there tables, lists, specific heading hierarchies, or formatting conventions?
5. **SEO Elements**: How are keywords used? Any patterns in titles, subheadings, or content organization?
6. **Length & Depth**: Typical article length and level of detail?

Provide a comprehensive analysis that will guide content generation for this brief type. Be specific and actionable.`;

    // Use Content Generation Agent to analyze
    const result = await generateContent({
      brief: analysisPrompt,
      primaryKeywords: [],
      secondaryKeywords: [],
      targetWordCount: 800,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || 'Failed to analyze URLs');
    }

    return NextResponse.json({
      success: true,
      analysis: result.content,
      urlsAnalyzed: urlContents.filter(u => !u.error).length,
      totalUrls: urls.length,
    });
  } catch (error: any) {
    console.error('[Brief URL Analysis] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
