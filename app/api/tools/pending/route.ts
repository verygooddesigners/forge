// API route: /api/tools/pending
// GET: Get pending tools for admin review
// ADMIN ONLY

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get all pending tools with author info
    const { data: pendingTools, error } = await supabase
      .from('tools')
      .select(`
        *,
        author:users!tools_author_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/tools/pending] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending tools' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tools: pendingTools || [],
    });
  } catch (error) {
    console.error('[GET /api/tools/pending] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
