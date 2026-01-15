import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

const SUPER_ADMIN_EMAILS = new Set([
  'jeremy.botter@gmail.com',
  'jeremy.botter@gdcgroup.com',
]);

function isSuperAdmin(email?: string | null) {
  return !!email && SUPER_ADMIN_EMAILS.has(email);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200);

    const supabase = await createClient();
    let query = supabase
      .from('cursor_remote_commands')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return NextResponse.json({ commands: data });
  } catch (error) {
    console.error('Error fetching cursor commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const commandText = String(body.commandText || '').trim();
    const targetAgentId = body.targetAgentId ? String(body.targetAgentId).trim() : null;

    if (!commandText) {
      return NextResponse.json(
        { error: 'Command text is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cursor_remote_commands')
      .insert({
        command_text: commandText,
        target_agent_id: targetAgentId || null,
        created_by: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ command: data });
  } catch (error) {
    console.error('Error creating cursor command:', error);
    return NextResponse.json(
      { error: 'Failed to create command' },
      { status: 500 }
    );
  }
}
