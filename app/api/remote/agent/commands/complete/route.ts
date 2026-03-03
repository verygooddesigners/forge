import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateRemoteAgentToken } from '@/lib/remote-agent';

// Cast to any — admin client lacks a Database generic so .from() infers `never`
const getAdmin = () => createAdminClient() as any;

export async function POST(request: NextRequest) {
  const auth = validateRemoteAgentToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const commandId = String(body.commandId || '').trim();
    const agentId = body.agentId ? String(body.agentId).trim() : null;

    if (!commandId) {
      return NextResponse.json(
        { error: 'commandId is required' },
        { status: 400 }
      );
    }

    const status = body.status === 'failed' ? 'failed' : 'completed';
    const now = new Date().toISOString();

    const updates: Record<string, any> = {
      status,
      completed_at: now,
      result_text: body.resultText || null,
      error_text: body.errorText || null,
    };

    if (agentId) {
      updates.claimed_by = agentId;
    }

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from('cursor_remote_commands')
      .update(updates)
      .eq('id', commandId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ command: data });
  } catch (error) {
    console.error('Error completing cursor command:', error);
    return NextResponse.json(
      { error: 'Failed to complete command' },
      { status: 500 }
    );
  }
}
