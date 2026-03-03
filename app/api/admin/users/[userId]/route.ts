import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission } from '@/lib/auth-config';

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) return null;

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const { user: adminUser, allowed } = await checkApiPermission('can_edit_users');
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { full_name, role, account_status, is_tool_creator, default_writer_model_id } = body;

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (role !== undefined) updatePayload.role = role;
    if (account_status !== undefined) updatePayload.account_status = account_status;
    if (is_tool_creator !== undefined) updatePayload.is_tool_creator = is_tool_creator;
    if (default_writer_model_id !== undefined) updatePayload.default_writer_model_id = default_writer_model_id || null;

    const { error } = await adminClient
      .from('users')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const { user: adminUser, allowed } = await checkApiPermission('can_delete_users');
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (userId === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { error: profileError } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Profile deleted but auth user removal failed:', authError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
