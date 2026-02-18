import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { countWordsInTipTapJson } from '@/lib/word-count';
import type { AnalyticsSummary, DailyBreakdown } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const targetUserId = searchParams.get('userId') || user.id;

    // If querying another user's data, verify team_leader+ role
    if (targetUserId !== user.id) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      const roleLevel: Record<string, number> = { super_admin: 5, admin: 4, manager: 3, team_leader: 2, content_creator: 1 };
      if (!profile || (roleLevel[profile.role] || 0) < 2) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch analytics events
    let eventsQuery = supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', targetUserId);
    if (from) eventsQuery = eventsQuery.gte('created_at', from);
    if (to) eventsQuery = eventsQuery.lte('created_at', `${to}T23:59:59.999Z`);
    const { data: events } = await eventsQuery;

    // Fetch projects for word counts and SEO scores
    let projectsQuery = supabase
      .from('projects')
      .select('id, content, seo_score, created_at')
      .eq('user_id', targetUserId);
    if (from) projectsQuery = projectsQuery.gte('created_at', from);
    if (to) projectsQuery = projectsQuery.lte('created_at', `${to}T23:59:59.999Z`);
    const { data: projects } = await projectsQuery;

    // Fetch briefs
    let briefsQuery = supabase
      .from('briefs')
      .select('id, is_shared, created_at')
      .eq('created_by', targetUserId);
    if (from) briefsQuery = briefsQuery.gte('created_at', from);
    if (to) briefsQuery = briefsQuery.lte('created_at', `${to}T23:59:59.999Z`);
    const { data: briefs } = await briefsQuery;

    const safeEvents = events || [];
    const safeProjects = projects || [];
    const safeBriefs = briefs || [];

    // Compute word counts
    const wordCounts = safeProjects.map((p) => countWordsInTipTapJson(p.content));
    const totalWords = wordCounts.reduce((sum, w) => sum + w, 0);
    const avgWordCount = safeProjects.length > 0 ? Math.round(totalWords / safeProjects.length) : 0;

    // SEO score
    const seoScores = safeProjects.filter((p) => p.seo_score != null).map((p) => Number(p.seo_score));
    const avgSeoScore = seoScores.length > 0 ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length) : 0;

    // Event counts
    const projectsExported = safeEvents.filter((e) => e.event_type === 'project_exported').length;
    const briefsEdited = safeEvents.filter((e) => e.event_type === 'brief_edited').length;

    // Daily breakdown
    const dailyMap = new Map<string, DailyBreakdown>();
    for (const p of safeProjects) {
      const day = p.created_at.split('T')[0];
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, projects_created: 0, words_written: 0, exports: 0, briefs_created: 0 });
      }
      const entry = dailyMap.get(day)!;
      entry.projects_created++;
      entry.words_written += countWordsInTipTapJson(p.content);
    }
    for (const b of safeBriefs) {
      const day = b.created_at.split('T')[0];
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, projects_created: 0, words_written: 0, exports: 0, briefs_created: 0 });
      }
      dailyMap.get(day)!.briefs_created++;
    }
    for (const e of safeEvents) {
      if (e.event_type === 'project_exported') {
        const day = e.created_at.split('T')[0];
        if (!dailyMap.has(day)) {
          dailyMap.set(day, { date: day, projects_created: 0, words_written: 0, exports: 0, briefs_created: 0 });
        }
        dailyMap.get(day)!.exports++;
      }
    }

    const daily_breakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const summary: AnalyticsSummary = {
      projects_created: safeProjects.length,
      projects_exported: projectsExported,
      total_words: totalWords,
      avg_word_count: avgWordCount,
      briefs_created: safeBriefs.length,
      briefs_edited: briefsEdited,
      briefs_shared: safeBriefs.filter((b) => b.is_shared).length,
      avg_seo_score: avgSeoScore,
      daily_breakdown,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Analytics personal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
