// API route: /api/tools/[toolId]/install
// POST: Install a tool for the current user

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

    // Verify tool exists and is approved
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id, name, status')
      .eq('id', toolId)
      .single();

    if (toolError || !tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    if (tool.status !== 'approved') {
      return NextResponse.json(
        { error: 'Tool is not approved for installation' },
        { status: 400 }
      );
    }

    // Check if already installed
    const { data: existing } = await supabase
      .from('user_installed_tools')
      .select('id, enabled')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .single();

    if (existing) {
      // If already installed but disabled, enable it
      if (!existing.enabled) {
        const { error: updateError } = await supabase
          .from('user_installed_tools')
          .update({ enabled: true })
          .eq('id', existing.id);

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to enable tool' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Tool enabled successfully',
          tool_id: toolId,
        });
      }

      return NextResponse.json({
        message: 'Tool is already installed',
        tool_id: toolId,
      });
    }

    // Install the tool
    const { error: installError } = await supabase
      .from('user_installed_tools')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        enabled: true,
      });

    if (installError) {
      console.error('[POST /api/tools/[toolId]/install] Error:', installError);
      return NextResponse.json(
        { error: 'Failed to install tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Tool installed successfully',
      tool_id: toolId,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tools/[toolId]/install] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
