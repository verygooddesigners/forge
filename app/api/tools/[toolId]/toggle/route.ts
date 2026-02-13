// API route: /api/tools/[toolId]/toggle
// POST: Enable or disable a tool without uninstalling

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const supabase = await createClient();
    const { toolId } = await params;

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Update the enabled status
    const { error: updateError } = await supabase
      .from('user_installed_tools')
      .update({ enabled })
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (updateError) {
      console.error('[POST /api/tools/[toolId]/toggle] Error:', updateError);
      return NextResponse.json(
        { error: 'Failed to toggle tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Tool ${enabled ? 'enabled' : 'disabled'} successfully`,
      tool_id: toolId,
      enabled,
    });
  } catch (error) {
    console.error('[POST /api/tools/[toolId]/toggle] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
