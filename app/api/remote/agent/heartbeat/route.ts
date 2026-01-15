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
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('cursor_agent_status')
      .upsert(
        {
          agent_id: agentId,
          status: body.status || 'idle',
          current_task: body.currentTask || null,
          last_message: body.lastMessage || null,
          last_heartbeat: now,
          metadata: body.metadata || {},
        },
        { onConflict: 'agent_id' }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('Error updating agent heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    );
  }
}
