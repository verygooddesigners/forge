// API route: /api/tools
// GET: List all approved tools (with install status for authenticated users)
// POST: Submit a new tool for approval

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SubmitToolRequest, ToolWithInstallStatus } from '@/types/tools';
import { validatePermissions } from '@/lib/tools/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tools
 * List all approved tools with install status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get current user (optional for public browsing)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');
    const offset = (page - 1) * perPage;

    // Build query for approved tools
    let query = supabase
      .from('tools')
      .select(`
        *,
        author:users!tools_author_id_fkey (
          id,
          email,
          full_name
        )
      `, { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description_short.ilike.%${search}%`);
    }

    const { data: tools, error, count } = await query;

    if (error) {
      console.error('[GET /api/tools] Error fetching tools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tools' },
        { status: 500 }
      );
    }

    // If user is authenticated, add install status
    let toolsWithStatus: ToolWithInstallStatus[] = [];
    
    if (user && tools) {
      // Get user's installed tools
      const { data: installedTools } = await supabase
        .from('user_installed_tools')
        .select('tool_id, enabled')
        .eq('user_id', user.id);

      const installedMap = new Map(
        installedTools?.map((it) => [it.tool_id, it.enabled]) || []
      );

      // Get install counts for each tool
      const { data: installCounts } = await supabase
        .from('user_installed_tools')
        .select('tool_id')
        .in('tool_id', tools.map(t => t.id));

      const countMap = new Map<string, number>();
      installCounts?.forEach((ic) => {
        countMap.set(ic.tool_id, (countMap.get(ic.tool_id) || 0) + 1);
      });

      toolsWithStatus = tools.map((tool) => ({
        ...tool,
        is_installed: installedMap.has(tool.id),
        is_enabled: installedMap.get(tool.id) || false,
        install_count: countMap.get(tool.id) || 0,
      }));
    } else {
      // For non-authenticated users, just add install counts
      if (tools) {
        const { data: installCounts } = await supabase
          .from('user_installed_tools')
          .select('tool_id')
          .in('tool_id', tools.map(t => t.id));

        const countMap = new Map<string, number>();
        installCounts?.forEach((ic) => {
          countMap.set(ic.tool_id, (countMap.get(ic.tool_id) || 0) + 1);
        });

        toolsWithStatus = tools.map((tool) => ({
          ...tool,
          is_installed: false,
          is_enabled: false,
          install_count: countMap.get(tool.id) || 0,
        }));
      }
    }

    return NextResponse.json({
      tools: toolsWithStatus,
      total: count || 0,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error('[GET /api/tools] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools
 * Submit a new tool for approval
 */
export async function POST(request: NextRequest) {
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

    const body: SubmitToolRequest = await request.json();
    const { github_repo_url, contact_email, notes } = body;

    // Validate required fields
    if (!github_repo_url) {
      return NextResponse.json(
        { error: 'GitHub repository URL is required' },
        { status: 400 }
      );
    }

    // TODO: In production, fetch and validate the manifest from GitHub
    // For now, we'll require the manifest data to be provided in the submission form
    // This will be implemented in Phase 4 when we build the submission form

    // For MVP, create a pending tool record
    // The admin will manually review the GitHub repo and approve/reject
    const { data: tool, error: insertError } = await supabase
      .from('tools')
      .insert({
        name: 'Pending Review',
        slug: `pending-${Date.now()}`,
        description_short: 'Awaiting admin review',
        description_long: notes || 'Tool submitted for review',
        github_repo_url,
        author_id: user.id,
        status: 'pending',
        permissions_requested: [],
        sidebar_label: 'Pending',
        sidebar_icon: 'Package',
        sidebar_order: 999,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[POST /api/tools] Error creating tool:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit tool' },
        { status: 500 }
      );
    }

    // TODO: Send notification to admin about new submission
    // This will be implemented when we add the admin notification system

    return NextResponse.json({
      message: 'Tool submitted successfully',
      tool,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tools] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
