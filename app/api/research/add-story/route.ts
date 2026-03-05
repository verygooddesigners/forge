import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { generateContent } from '@/lib/ai';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, key);
}

// Extract metadata from HTML
function extractMeta(html: string, url: string) {
  const getTag = (pattern: RegExp) => {
    const m = html.match(pattern);
    return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : '';
  };

  const title =
    getTag(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    getTag(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
    getTag(/<title[^>]*>([^<]+)<\/title>/i) ||
    new URL(url).hostname;

  const description =
    getTag(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    getTag(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
    getTag(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    getTag(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
    '';

  const publishedDate =
    getTag(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i) ||
    getTag(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i) ||
    getTag(/<time[^>]+datetime=["']([^"']+)["']/i) ||
    new Date().toISOString();

  const source = new URL(url).hostname.replace(/^www\./, '');

  return { title, description, publishedDate, source };
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, url } = await request.json();

    if (!projectId || !url?.trim()) {
      return NextResponse.json({ error: 'Missing projectId or url' }, { status: 400 });
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check privileges
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    const isPrivileged =
      userRow?.role === 'Super Administrator' || userRow?.role === 'admin';

    // Verify project access
    let projectQuery = supabase.from('projects').select('id').eq('id', projectId);
    if (!isPrivileged) {
      projectQuery = projectQuery.eq('user_id', user.id);
    }
    const { data: project } = await projectQuery.single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
    }

    // Fetch the page
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ForgeBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
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
    const { title, description, publishedDate, source } = extractMeta(html, url);

    // Strip HTML to raw text
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (textContent.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from this URL' },
        { status: 422 }
      );
    }

    // Use AI to extract clean article body
    const truncated = textContent.slice(0, 15000);
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are a content extraction assistant. Given raw text from a web page, extract ONLY the main article content. Remove navigation, ads, sidebars, author bios, related articles, and any non-article text. Return the clean article text with proper paragraph breaks. If no article content is found, return an empty string.',
      },
      {
        role: 'user' as const,
        content: `Extract the main article content from this page text:\n\n${truncated}`,
      },
    ];

    const extractedContent = await generateContent(messages, {
      temperature: 0.1,
      maxTokens: 4000,
    });

    const fullContent = extractedContent?.trim() || textContent.slice(0, 2000);

    // Build the new story
    const newStory = {
      id: crypto.randomUUID(),
      title: title || url,
      description: description || fullContent.slice(0, 200),
      url,
      source,
      published_date: publishedDate,
      relevance_score: 1.0,
      trust_score: 1.0,
      is_trusted: true,
      is_flagged: false,
      full_content: fullContent,
      synopsis: fullContent.slice(0, 150),
      is_selected: true,
      verification_status: 'verified' as const,
      is_manual: true,
    };

    // Load existing research record
    const db = isPrivileged ? getServiceClient() : supabase;
    const { data: existing } = await db
      .from('project_research')
      .select('*')
      .eq('project_id', projectId)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Parse stories
      let stories: any[] = [];
      if (Array.isArray(existing.stories)) {
        stories = existing.stories;
      } else if (typeof existing.stories === 'string') {
        try { stories = JSON.parse(existing.stories); } catch { stories = []; }
      }

      const updatedStories = [...stories, newStory];
      const updatedSelectedIds = [...(existing.selected_story_ids || []), newStory.id];

      await db
        .from('project_research')
        .update({
          stories: updatedStories,
          selected_story_ids: updatedSelectedIds,
          updated_at: now,
        })
        .eq('project_id', projectId);
    } else {
      // Create a new research record
      await db.from('project_research').insert({
        project_id: projectId,
        stories: [newStory],
        selected_story_ids: [newStory.id],
        suggested_keywords: [],
        selected_keywords: [],
        orchestrator_log: [],
        loops_completed: 0,
        status: 'completed',
        created_at: now,
        updated_at: now,
      });
    }

    return NextResponse.json({ story: newStory });
  } catch (error: any) {
    console.error('Add story error:', error);
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out fetching URL' }, { status: 408 });
    }
    return NextResponse.json(
      { error: 'Failed to add story', details: error.message },
      { status: 500 }
    );
  }
}
