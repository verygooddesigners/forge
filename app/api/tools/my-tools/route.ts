// API route: /api/tools/my-tools
// GET: Get current user's installed tools

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's installed tools with tool details
    const { data: installedTools, error } = await supabase
      .from('user_installed_tools')
      .select(`
        *,
        tool:tools (
          id,
          name,
          slug,
          description_short,
          icon_url,
          version,
          permissions_requested,
          sidebar_label,
          sidebar_icon,
          sidebar_order
        )
      `)
      .eq('user_id', user.id)
      .order('installed_at', { ascending: false });

    if (error) {
      console.error('[GET /api/tools/my-tools] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch installed tools' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tools: installedTools || [],
    });
  } catch (error) {
    console.error('[GET /api/tools/my-tools] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
