import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSourceNotes, generateMasterNotes, SourceNote } from '@/lib/news-forge/notes-generator';
import { generateContent } from '@/lib/ai';

function extractMeta(html: string, url: string) {
  const getTag = (pattern: RegExp) => {
    const m = html.match(pattern);
    return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : '';
  };
  const title =
    getTag(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    getTag(/<title[^>]*>([^<]+)<\/title>/i) ||
    new URL(url).hostname;
  return { title };
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ForgeBot/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract main article content
    const extracted = await generateContent(
      [
        { role: 'system', content: 'Extract ONLY the main article content from this page text. Remove navigation, ads, sidebars, related articles. Return clean article text.' },
        { role: 'user', content: text.slice(0, 12000) },
      ],
      { temperature: 0.1, maxTokens: 3000 }
    );
    return extracted || text.slice(0, 3000);
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pitch_id } = await req.json();
    if (!pitch_id) return NextResponse.json({ error: 'Missing pitch_id' }, { status: 400 });

    // Verify ownership
    const { data: pitch } = await supabase
      .from('news_forge_pitches')
      .select('*, sources:news_forge_pitch_sources(*)')
      .eq('id', pitch_id)
      .single();
    if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', pitch.project_id)
      .eq('user_id', user.id)
      .single();
    if (!project) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const usedSources = (pitch.sources || []).filter((s: any) => s.status === 'used');
    if (usedSources.length === 0) {
      return NextResponse.json({ error: 'No sources marked as used. Please mark at least one source as used first.' }, { status: 422 });
    }

    const sourceNotes: SourceNote[] = [];

    for (const src of usedSources) {
      let content = src.full_content || '';
      if (!content) {
        content = await fetchArticleContent(src.url);
        if (content) {
          await supabase
            .from('news_forge_pitch_sources')
            .update({ full_content: content })
            .eq('id', src.id);
        }
      }

      if (!content) continue;

      const notes = await generateSourceNotes(src.title, src.url, content);
      await supabase
        .from('news_forge_pitch_sources')
        .update({ source_notes: notes })
        .eq('id', src.id);

      sourceNotes.push({
        title: src.title,
        url: src.url,
        source_domain: src.source_domain,
        notes,
      });
    }

    const masterNotes = await generateMasterNotes(sourceNotes, pitch.headline, pitch.synopsis || '');

    await supabase
      .from('news_forge_pitches')
      .update({ master_notes: masterNotes, updated_at: new Date().toISOString() })
      .eq('id', pitch_id);

    return NextResponse.json({
      master_notes: masterNotes,
      source_notes: sourceNotes,
    });
  } catch (err: any) {
    console.error('Notes generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
