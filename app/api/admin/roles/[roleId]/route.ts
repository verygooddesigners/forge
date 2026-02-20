import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission } from '@/lib/auth-config';

/**
 * PATCH /api/admin/roles/[roleId]
 * Update role name, description, and/or permissions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { user, allowed } = await checkApiPermission('can_manage_role_permissions');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { roleId } = await params;
  const body = await request.json();
  const { name, description, permissions } = body as {
    name?: string;
    description?: string;
    permissions?: Record<string, boolean>;
  };

  const supabase = await createClient();

  // Get existing role
  const { data: existingRole, error: fetchError } = await supabase
    .from('roles')
    .select('name')
    .eq('id', roleId)
    .single();

  if (fetchError || !existingRole) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  const oldRoleName = existingRole.name;

  // Build update payload
  const updates: Record<string, string | null> = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description?.trim() || null;

  let updatedRole = existingRole;

  if (Object.keys(updates).length > 0) {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A role with this name already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    updatedRole = data;

    // If name changed, update role_permissions to use new name
    if (name && name.trim() !== oldRoleName) {
      await supabase
        .from('role_permissions')
        .update({ role: name.trim() })
        .eq('role', oldRoleName);

      // Also update users with this role
      await supabase
        .from('users')
        .update({ role: name.trim() })
        .eq('role', oldRoleName);
    }
  }

  // Upsert permissions if provided
  if (permissions && Object.keys(permissions).length > 0) {
    const currentRoleName = (name ? name.trim() : oldRoleName);
    const upserts = Object.entries(permissions).map(([key, enabled]) => ({
      role: currentRoleName,
      permission_key: key,
      enabled,
      updated_by: user.id,
    }));

    const { error: permError } = await supabase
      .from('role_permissions')
      .upsert(upserts, { onConflict: 'role,permission_key' });

    if (permError) {
      return NextResponse.json({ error: permError.message }, { status: 500 });
    }
  }

  return NextResponse.json(updatedRole);
}

/**
 * DELETE /api/admin/roles/[roleId]
 * Delete a role (only if no users are assigned to it)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { user, allowed } = await checkApiPermission('can_manage_role_permissions');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { roleId } = await params;
  const supabase = await createClient();

  // Get the role name
  const { data: role, error: fetchError } = await supabase
    .from('roles')
    .select('name')
    .eq('id', roleId)
    .single();

  if (fetchError || !role) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  // Check if any users have this role
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', role.name);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete role with assigned users (${count} user${count === 1 ? '' : 's'})` },
      { status: 409 }
    );
  }

  // Delete role (role_permissions rows should be cleaned up manually or via cascade)
  const { error: deleteError } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Also clean up orphaned role_permissions
  await supabase
    .from('role_permissions')
    .delete()
    .eq('role', role.name);

  return NextResponse.json({ success: true });
}
