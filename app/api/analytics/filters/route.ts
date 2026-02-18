import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET: list user's saved filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('token');

    if (shareToken) {
      // Load a shared filter by token
      const { data: filter } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_shared', true)
        .single();
      return NextResponse.json({ filter });
    }

    const { data: filters } = await supabase
      .from('saved_filters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ filters: filters || [] });
  } catch (error) {
    console.error('Filters GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: save a new filter
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, filter_config, is_shared } = body;

    if (!name || !filter_config) {
      return NextResponse.json({ error: 'Name and filter_config required' }, { status: 400 });
    }

    const shareToken = is_shared ? crypto.randomUUID().replace(/-/g, '').slice(0, 12) : null;

    const { data: filter, error } = await supabase
      .from('saved_filters')
      .insert({
        user_id: user.id,
        name,
        filter_config,
        is_shared: !!is_shared,
        share_token: shareToken,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ filter });
  } catch (error) {
    console.error('Filters POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: delete a filter
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filterId = searchParams.get('id');
    if (!filterId) return NextResponse.json({ error: 'Filter ID required' }, { status: 400 });

    const { error } = await supabase
      .from('saved_filters')
      .delete()
      .eq('id', filterId)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Filters DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
