import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('news_source_lists')
    .select('*, items:news_source_list_items(id)')
    .eq('user_id', user.id)
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lists: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, list_id, list_name, url, title, source_domain, trust_score } = await req.json();

  if (action === 'create_list') {
    if (!list_name) return NextResponse.json({ error: 'Missing list_name' }, { status: 400 });
    const { data, error } = await supabase
      .from('news_source_lists')
      .insert({ user_id: user.id, name: list_name })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ list: data }, { status: 201 });
  }

  if (action === 'add_item') {
    if (!list_id || !url) return NextResponse.json({ error: 'Missing list_id or url' }, { status: 400 });

    // Verify list ownership
    const { data: list } = await supabase
      .from('news_source_lists')
      .select('id')
      .eq('id', list_id)
      .eq('user_id', user.id)
      .single();
    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('news_source_list_items')
      .upsert({ list_id, url, title, source_domain, trust_score }, { onConflict: 'list_id,url' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data }, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const list_id = searchParams.get('list_id');
  if (!list_id) return NextResponse.json({ error: 'Missing list_id' }, { status: 400 });

  const { error } = await supabase
    .from('news_source_lists')
    .delete()
    .eq('id', list_id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
