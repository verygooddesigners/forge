import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { discoverSportingEvents } from '@/lib/news-forge/sports-discovery';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { site_id } = await req.json();
    if (!site_id) return NextResponse.json({ error: 'Missing site_id' }, { status: 400 });

    const { data: site, error } = await supabase
      .from('news_sites')
      .select('*')
      .eq('id', site_id)
      .single();

    if (error || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const discovery = await discoverSportingEvents(site, currentDate);
    return NextResponse.json({ discovery });
  } catch (err: any) {
    console.error('Sports discovery error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
