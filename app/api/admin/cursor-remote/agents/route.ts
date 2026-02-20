import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/auth-config';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cursor_agent_status')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ agents: data });
  } catch (error) {
    console.error('Error fetching cursor agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agent status' }, { status: 500 });
  }
}
