// API route: /api/tools/[toolId]/uninstall
// POST: Uninstall a tool for the current user

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

    // Delete the installation record
    const { error: deleteError } = await supabase
      .from('user_installed_tools')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (deleteError) {
      console.error('[POST /api/tools/[toolId]/uninstall] Error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to uninstall tool' },
        { status: 500 }
      );
    }

    // Note: Tool data is preserved even after uninstall
    // Users can reinstall and their data will still be there
    // To delete tool data, they would need to use a separate endpoint

    return NextResponse.json({
      message: 'Tool uninstalled successfully',
      tool_id: toolId,
    });
  } catch (error) {
    console.error('[POST /api/tools/[toolId]/uninstall] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
