import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission } from '@/lib/auth-config';

export async function GET() {
  try {
    const { user, allowed } = await checkApiPermission('can_manage_teams');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = await createClient();
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        manager:users!teams_managed_by_fkey(id, email, full_name),
        team_members(id)
      `)
      .order('name');

    if (error) throw error;

    const result = (teams ?? []).map((t: any) => ({
      ...t,
      member_count: t.team_members?.length ?? 0,
      team_members: undefined,
    }));

    return NextResponse.json({ teams: result });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, allowed } = await checkApiPermission('can_manage_teams');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, description, managed_by } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        managed_by: managed_by || user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
