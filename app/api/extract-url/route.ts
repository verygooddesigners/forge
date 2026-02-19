import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the page content
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ForgeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (${pageResponse.status})` },
        { status: 422 }
      );
    }

    const html = await pageResponse.text();

    // Strip HTML to get raw text
    const textContent = html
      // Remove script and style blocks
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim();

    if (textContent.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from this URL' },
        { status: 422 }
      );
    }

    // Truncate to avoid token limits (roughly 15k chars)
    const truncated = textContent.slice(0, 15000);

    // Use AI to extract just the article body
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a content extraction assistant. Given raw text from a web page, extract ONLY the main article content. Remove navigation, ads, sidebars, author bios, related articles, and any non-article text. Return the clean article text with proper paragraph breaks. If no article content is found, return an empty string.',
      },
      {
        role: 'user' as const,
        content: `Extract the main article content from this page text:\n\n${truncated}`,
      },
    ];

    const extracted = await generateContent(messages, {
      temperature: 0.1,
      maxTokens: 4000,
    });

    if (!extracted || extracted.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract article content from this URL' },
        { status: 422 }
      );
    }

    return NextResponse.json({ content: extracted.trim() });
  } catch (error: any) {
    console.error('URL extraction error:', error);
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out fetching URL' }, { status: 408 });
    }
    return NextResponse.json(
      { error: 'Failed to extract content', details: error.message },
      { status: 500 }
    );
  }
}
