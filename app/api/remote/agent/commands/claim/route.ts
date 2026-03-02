import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find the oldest pending command for this agent
    const { data: command, error: fetchError } = await supabase
      .from('agent_commands')
      .select('*')
      .eq('agent_id', agentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!command) return NextResponse.json({ command: null });

    // Claim it
    const { error: updateError } = await supabase
      .from('agent_commands')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .eq('id', command.id)
      .eq('status', 'pending');

    if (updateError) throw updateError;
    return NextResponse.json({ command });
  } catch (error) {
    console.error('Command claim error:', error);
    return NextResponse.json({ error: 'Failed to claim command' }, { status: 500 });
  }
}
