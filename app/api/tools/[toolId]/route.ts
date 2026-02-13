// API route: /api/tools/[toolId]
// GET: Get tool details
// PUT: Update tool (admin or author for pending tools)
// DELETE: Delete tool (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApproveToolRequest } from '@/types/tools';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tools/[toolId]
 * Get tool details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const supabase = await createClient();
    const { toolId } = await params;

    const { data: tool, error } = await supabase
      .from('tools')
      .select(`
        *,
        author:users!tools_author_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq('id', toolId)
      .single();

    if (error || !tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user can view this tool
    const { data: { user } } = await supabase.auth.getUser();
    
    // Public can only see approved tools
    if (tool.status !== 'approved') {
      if (!user) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }

      // Check if user is admin or author
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin';
      const isAuthor = user.id === tool.author_id;

      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
    }

    // If user is authenticated, add install status
    if (user) {
      const { data: installation } = await supabase
        .from('user_installed_tools')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('tool_id', toolId)
        .single();

      return NextResponse.json({
        ...tool,
        is_installed: !!installation,
        is_enabled: installation?.enabled || false,
      });
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error('[GET /api/tools/[toolId]] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tools/[toolId]
 * Update tool (approve/reject for admin, edit for author)
 */
export async function PUT(
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

    // Get tool
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (toolError || !tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'admin';
    const isAuthor = user.id === tool.author_id;

    const body = await request.json();

    // Admin approval/rejection
    if (isAdmin && ('approved' in body || 'status' in body)) {
      const approved = body.approved;
      const newStatus = body.status || (approved ? 'approved' : 'rejected');

      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user.id;
      }

      const { data: updatedTool, error: updateError } = await supabase
        .from('tools')
        .update(updateData)
        .eq('id', toolId)
        .select()
        .single();

      if (updateError) {
        console.error('[PUT /api/tools/[toolId]] Error updating:', updateError);
        return NextResponse.json(
          { error: 'Failed to update tool' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Tool ${newStatus} successfully`,
        tool: updatedTool,
      });
    }

    // Author editing their pending tool
    if (isAuthor && tool.status === 'pending') {
      const allowedFields = [
        'name',
        'description_short',
        'description_long',
        'github_repo_url',
        'icon_url',
        'permissions_requested',
        'sidebar_label',
        'sidebar_icon',
        'sidebar_order',
        'version',
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (field in body) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      const { data: updatedTool, error: updateError } = await supabase
        .from('tools')
        .update(updateData)
        .eq('id', toolId)
        .select()
        .single();

      if (updateError) {
        console.error('[PUT /api/tools/[toolId]] Error updating:', updateError);
        return NextResponse.json(
          { error: 'Failed to update tool' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Tool updated successfully',
        tool: updatedTool,
      });
    }

    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  } catch (error) {
    console.error('[PUT /api/tools/[toolId]] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tools/[toolId]
 * Delete tool (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const supabase = await createClient();
    const { toolId } = await params;

    // Verify user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Delete the tool (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId);

    if (deleteError) {
      console.error('[DELETE /api/tools/[toolId]] Error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Tool deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE /api/tools/[toolId]] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
