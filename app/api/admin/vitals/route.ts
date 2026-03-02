import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_METRICS = ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'];
const VALID_RATINGS = ['good', 'needs-improvement', 'poor'];

// Cast to any to avoid `never` type errors — admin client lacks Database generic
const getAdmin = () => createAdminClient() as any;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = Array.isArray(body) ? body : [body];

    // Validate & sanitize
    const rows = entries
      .filter((e: any) => VALID_METRICS.includes(e.name) && typeof e.value === 'number')
      .map((e: any) => ({
        metric_name: e.name,
        value: Math.round(e.value * 100) / 100,
        rating: VALID_RATINGS.includes(e.rating) ? e.rating : null,
        pathname: typeof e.pathname === 'string' ? e.pathname.slice(0, 500) : null,
        navigation_type: typeof e.navigationType === 'string' ? e.navigationType : null,
        user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
        connection_type: typeof e.connectionType === 'string' ? e.connectionType : null,
      }));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    const admin = getAdmin();
    const { error } = await admin.from('web_vitals').insert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (err: any) {
    console.error('[vitals POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Auth check — reuse the pattern from other admin routes
    const { createClient } = await import('@/lib/supabase/server');
    const { isSuperAdmin } = await import('@/lib/super-admin');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = getAdmin();
    const url = new URL(req.url);
    const hours = parseInt(url.searchParams.get('hours') || '24', 10);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Fetch raw vitals for the period
    const { data: vitals, error } = await admin
      .from('web_vitals')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: vitals ?? [], since, hours });
  } catch (err: any) {
    console.error('[vitals GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
