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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { supabase, user } = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        added_at,
        user:users(id, email, full_name, role)
      `)
      .eq('team_id', teamId)
      .order('added_at');

    if (error) throw error;

    return NextResponse.json({ members: members ?? [] });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { supabase, user, profile } = await getAdminUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canManageTeams(profile.role as UserRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id })
      .select(`
        id,
        user_id,
        added_at,
        user:users(id, email, full_name, role)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'User is already a member of this team' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
