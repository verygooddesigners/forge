import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchTavily, searchSerper, loadTrustedSources } from '@/lib/research';
import { generatePitches } from '@/lib/news-forge/pitch-generator';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id } = await req.json();
    if (!project_id) return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });

    // Load NF project + site info
    const { data: nfProject, error: nfErr } = await supabase
      .from('news_forge_projects')
      .select('*, site:news_sites(*)')
      .eq('project_id', project_id)
      .single();

    if (nfErr || !nfProject) {
      return NextResponse.json({ error: 'News Forge project not found' }, { status: 404 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, headline')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 403 });

    // Mark as researching
    await supabase
      .from('news_forge_projects')
      .update({ research_status: 'researching', updated_at: new Date().toISOString() })
      .eq('project_id', project_id);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const send = async (type: string, message: string) => {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type, message })}\n\n`)
      );
    };

    (async () => {
      try {
        await send('search', `Searching for news in ${nfProject.site.state}...`);

        const trustedSourcesMap = await loadTrustedSources(supabase);
        const site = nfProject.site;
        const sports = nfProject.selected_sports as string[];
        const teams = (nfProject.selected_teams as any[]).map((t) =>
          typeof t === 'string' ? t : t.name
        );

        // Build targeted search queries
        const queries: string[] = [];
        if (teams.length > 0) {
          queries.push(`${teams.slice(0, 3).join(' OR ')} latest news`);
        }
        if (sports.length > 0) {
          queries.push(`${sports.slice(0, 3).join(' OR ')} ${site.state} news`);
        }
        queries.push(`${site.state} sports betting news latest`);

        const allArticles: any[] = [];
        for (const q of queries) {
          await send('search', `Searching: "${q}"`);
          try {
            const results = await searchTavily(q, trustedSourcesMap, { max_results: 10, days: 14 });
            allArticles.push(...results);
          } catch {
            // continue
          }
        }

        // Add Serper results for the primary team/sport
        try {
          const serperQuery = teams[0] || sports[0] || site.state + ' sports';
          const serperResults = await searchSerper(serperQuery, trustedSourcesMap);
          allArticles.push(...serperResults);
        } catch {
          // continue
        }

        // Deduplicate by URL
        const seen = new Set<string>();
        const unique = allArticles.filter((a) => {
          if (seen.has(a.url)) return false;
          seen.add(a.url);
          return true;
        });

        await send('evaluate', `Evaluating ${unique.length} articles...`);

        // Generate pitches
        await send('evaluate', 'Generating story pitches...');
        const pitches = await generatePitches(unique, {
          site_name: site.name,
          selected_sports: sports,
          selected_teams: teams,
        });

        // Persist pitches + sources
        for (let i = 0; i < pitches.length; i++) {
          const p = pitches[i];
          const { data: pitchRow } = await supabase
            .from('news_forge_pitches')
            .insert({
              project_id,
              headline: p.headline,
              synopsis: p.synopsis,
              source_score: p.source_score,
              position: i,
              status: 'pending',
            })
            .select()
            .single();

          if (pitchRow) {
            for (const src of p.sources) {
              await supabase.from('news_forge_pitch_sources').insert({
                pitch_id: pitchRow.id,
                title: src.title,
                url: src.url,
                source_domain: src.source_domain,
                trust_score: src.trust_score,
                published_date: src.published_date,
                status: 'neutral',
              });
            }
          }
        }

        // Mark complete
        await supabase
          .from('news_forge_projects')
          .update({ research_status: 'pitches_ready', updated_at: new Date().toISOString() })
          .eq('project_id', project_id);

        await send('complete', `Research complete. Generated ${pitches.length} story pitches.`);
      } catch (err: any) {
        console.error('NF research error:', err);
        await supabase
          .from('news_forge_projects')
          .update({ research_status: 'pending', updated_at: new Date().toISOString() })
          .eq('project_id', project_id);
        await send('error', err.message || 'Research failed');
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
