import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission } from '@/lib/auth-config';

const ALL_PERMISSION_KEYS = [
  'can_create_projects', 'can_edit_own_projects', 'can_delete_own_projects',
  'can_share_projects', 'can_use_smartbriefs', 'can_edit_any_brief',
  'can_delete_any_brief', 'can_export_content', 'can_manage_own_writer_model',
  'can_use_ai_agents', 'can_tune_ai_agents', 'can_toggle_ai_agents',
  'can_edit_master_ai', 'can_manage_trusted_sources',
  'can_view_analytics', 'can_view_team_analytics',
  'can_view_users', 'can_create_users', 'can_edit_users', 'can_delete_users',
  'can_manage_teams', 'can_create_teams',
  'can_access_admin', 'can_view_user_guide', 'can_manage_api_keys',
  'can_manage_sso', 'can_manage_tools', 'can_manage_role_permissions',
];

/**
 * GET /api/admin/roles
 * List all roles with permission counts
 */
export async function GET() {
  const { user, allowed } = await checkApiPermission('can_manage_role_permissions');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = await createClient();

  const { data: roles, error } = await supabase
    .from('roles')
    .select('id, name, description, created_at, updated_at')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get permission counts per role
  const { data: permCounts } = await supabase
    .from('role_permissions')
    .select('role, enabled')
    .eq('enabled', true);

  const countMap: Record<string, number> = {};
  for (const row of permCounts ?? []) {
    countMap[row.role] = (countMap[row.role] ?? 0) + 1;
  }

  const rolesWithCounts = (roles ?? []).map((r) => ({
    ...r,
    permission_count: countMap[r.name] ?? 0,
  }));

  return NextResponse.json(rolesWithCounts);
}

/**
 * POST /api/admin/roles
 * Create a new role
 */
export async function POST(request: NextRequest) {
  const { user, allowed } = await checkApiPermission('can_manage_role_permissions');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, description } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Create the role
  const { data: role, error } = await supabase
    .from('roles')
    .insert({ name: name.trim(), description: description?.trim() || null })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert all 28 permission rows defaulting to false
  const permRows = ALL_PERMISSION_KEYS.map((key) => ({
    role: role.name,
    permission_key: key,
    enabled: false,
    updated_by: user.id,
  }));

  await supabase
    .from('role_permissions')
    .upsert(permRows, { onConflict: 'role,permission_key' });

  return NextResponse.json(role, { status: 201 });
}
