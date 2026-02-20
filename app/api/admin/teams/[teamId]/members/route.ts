import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission } from '@/lib/auth-config';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { user } = await checkApiPermission('can_manage_teams');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
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
    const { user, allowed } = await checkApiPermission('can_manage_teams');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
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
