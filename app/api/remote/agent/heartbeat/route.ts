import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, status, metadata } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('remote_agents')
      .upsert(
        {
          id: agentId,
          status: status ?? 'idle',
          last_heartbeat: new Date().toISOString(),
          metadata: metadata ?? {},
        },
        { onConflict: 'id' }
      );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 });
  }
}
