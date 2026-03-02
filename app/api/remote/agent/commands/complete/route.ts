import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { commandId, result, error: cmdError } = body;

    if (!commandId) {
      return NextResponse.json({ error: 'commandId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('agent_commands')
      .update({
        status: cmdError ? 'failed' : 'completed',
        result: result ?? null,
        error: cmdError ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', commandId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Command complete error:', error);
    return NextResponse.json({ error: 'Failed to complete command' }, { status: 500 });
  }
}
