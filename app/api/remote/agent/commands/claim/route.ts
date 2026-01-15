import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateRemoteAgentToken } from '@/lib/remote-agent';

export async function POST(request: NextRequest) {
  const auth = validateRemoteAgentToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const agentId = String(body.agentId || '').trim();

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: pending, error } = await supabase
      .from('cursor_remote_commands')
      .select('*')
      .eq('status', 'pending')
      .or(`target_agent_id.is.null,target_agent_id.eq.${agentId}`)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({ command: null });
    }

    const command = pending[0];
    const now = new Date().toISOString();

    const { data: updatedRows, error: updateError } = await supabase
      .from('cursor_remote_commands')
      .update({
        status: 'in_progress',
        claimed_by: agentId,
        claimed_at: now,
        started_at: now,
      })
      .eq('id', command.id)
      .eq('status', 'pending')
      .select();

    if (updateError) {
      throw updateError;
    }

    const updated = updatedRows?.[0] || null;
    return NextResponse.json({ command: updated });
  } catch (error) {
    console.error('Error claiming cursor command:', error);
    return NextResponse.json(
      { error: 'Failed to claim command' },
      { status: 500 }
    );
  }
}
