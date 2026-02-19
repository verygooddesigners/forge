import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { canManageTeams } from '@/lib/auth-config';
import { UserRole } from '@/types';

async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single();
  return { supabase, user, profile };
}

export async function GET() {
  try {
    const { supabase, user, profile } = await getAdminUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { supabase, user, profile } = await getAdminUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canManageTeams(profile.role as UserRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, managed_by } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

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
