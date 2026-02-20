import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { countWordsInTipTapJson } from '@/lib/word-count';
import type { AnalyticsSummary, DailyBreakdown, TeamMemberStats } from '@/types/analytics';
import { checkApiPermission } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { user, allowed } = await checkApiPermission('can_view_team_analytics');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden — can_view_team_analytics required' }, { status: 403 });

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get all users (team_leader+ can see all users for analytics)
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('account_status', 'confirmed')
      .order('full_name');

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({ members: [], aggregate: null });
    }

    // Build per-user stats
    const memberStats: TeamMemberStats[] = [];
    let aggProjects = 0, aggExports = 0, aggWords = 0, aggBriefs = 0, aggShared = 0, aggEdited = 0;
    let seoSum = 0, seoCount = 0, projectCount = 0;

    for (const u of allUsers) {
      // Projects
      let pq = supabase.from('projects').select('id, content, seo_score, created_at').eq('user_id', u.id);
      if (from) pq = pq.gte('created_at', from);
      if (to) pq = pq.lte('created_at', `${to}T23:59:59.999Z`);
      const { data: projects } = await pq;

      // Briefs
      let bq = supabase.from('briefs').select('id, is_shared, created_at').eq('created_by', u.id);
      if (from) bq = bq.gte('created_at', from);
      if (to) bq = bq.lte('created_at', `${to}T23:59:59.999Z`);
      const { data: briefs } = await bq;

      // Events
      let eq = supabase.from('analytics_events').select('*').eq('user_id', u.id);
      if (from) eq = eq.gte('created_at', from);
      if (to) eq = eq.lte('created_at', `${to}T23:59:59.999Z`);
      const { data: events } = await eq;

      const safeProjects = projects || [];
      const safeBriefs = briefs || [];
      const safeEvents = events || [];

      const wordCounts = safeProjects.map((p) => countWordsInTipTapJson(p.content));
      const totalWords = wordCounts.reduce((s, w) => s + w, 0);
      const avgWc = safeProjects.length > 0 ? Math.round(totalWords / safeProjects.length) : 0;
      const scores = safeProjects.filter((p) => p.seo_score != null).map((p) => Number(p.seo_score));
      const avgSeo = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const exported = safeEvents.filter((e) => e.event_type === 'project_exported').length;
      const edited = safeEvents.filter((e) => e.event_type === 'brief_edited').length;
      const shared = safeBriefs.filter((b) => b.is_shared).length;

      const summary: AnalyticsSummary = {
        projects_created: safeProjects.length,
        projects_exported: exported,
        total_words: totalWords,
        avg_word_count: avgWc,
        briefs_created: safeBriefs.length,
        briefs_edited: edited,
        briefs_shared: shared,
        avg_seo_score: avgSeo,
        daily_breakdown: [],
      };

      memberStats.push({ user: { id: u.id, full_name: u.full_name, email: u.email, role: u.role }, stats: summary });

      // Aggregate
      aggProjects += safeProjects.length;
      aggExports += exported;
      aggWords += totalWords;
      aggBriefs += safeBriefs.length;
      aggShared += shared;
      aggEdited += edited;
      projectCount += safeProjects.length;
      seoSum += scores.reduce((a, b) => a + b, 0);
      seoCount += scores.length;
    }

    const aggregate: AnalyticsSummary = {
      projects_created: aggProjects,
      projects_exported: aggExports,
      total_words: aggWords,
      avg_word_count: projectCount > 0 ? Math.round(aggWords / projectCount) : 0,
      briefs_created: aggBriefs,
      briefs_edited: aggEdited,
      briefs_shared: aggShared,
      avg_seo_score: seoCount > 0 ? Math.round(seoSum / seoCount) : 0,
      daily_breakdown: [],
    };

    return NextResponse.json({ members: memberStats, aggregate, users: allUsers });
  } catch (error) {
    console.error('Analytics team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
