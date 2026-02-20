import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { countWordsInTipTapJson } from '@/lib/word-count';
import { checkApiPermission } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user, allowed } = await checkApiPermission('can_view_team_analytics');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden — can_view_team_analytics required for export' }, { status: 403 });

    const supabase = await createClient();

    const body = await request.json();
    const { format, dateFrom, dateTo } = body;

    if (!format || !['csv', 'xlsx'].includes(format)) {
      return NextResponse.json({ error: 'Format must be csv or xlsx' }, { status: 400 });
    }

    // Get all confirmed users
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('account_status', 'confirmed');

    if (!users) return NextResponse.json({ error: 'No users found' }, { status: 404 });

    const rows: Record<string, any>[] = [];

    for (const u of users) {
      let pq = supabase.from('projects').select('id, content, seo_score').eq('user_id', u.id);
      if (dateFrom) pq = pq.gte('created_at', dateFrom);
      if (dateTo) pq = pq.lte('created_at', `${dateTo}T23:59:59.999Z`);
      const { data: projects } = await pq;

      let bq = supabase.from('briefs').select('id, is_shared').eq('created_by', u.id);
      if (dateFrom) bq = bq.gte('created_at', dateFrom);
      if (dateTo) bq = bq.lte('created_at', `${dateTo}T23:59:59.999Z`);
      const { data: briefs } = await bq;

      const safeProjects = projects || [];
      const safeBriefs = briefs || [];
      const totalWords = safeProjects.reduce((s, p) => s + countWordsInTipTapJson(p.content), 0);
      const scores = safeProjects.filter((p) => p.seo_score != null).map((p) => Number(p.seo_score));

      rows.push({
        Name: u.full_name || u.email,
        Email: u.email,
        Role: u.role,
        'Projects Created': safeProjects.length,
        'Total Words': totalWords,
        'Avg Word Count': safeProjects.length > 0 ? Math.round(totalWords / safeProjects.length) : 0,
        'Avg SEO Score': scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        'SmartBriefs Created': safeBriefs.length,
        'SmartBriefs Shared': safeBriefs.filter((b) => b.is_shared).length,
      });
    }

    // Return JSON data — client-side handles the actual file generation
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
